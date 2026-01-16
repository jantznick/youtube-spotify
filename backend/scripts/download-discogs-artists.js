import { PrismaClient } from '@prisma/client';
import https from 'https';
import fs from 'fs';
import { createWriteStream } from 'fs';
import { createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Get year/month from command line or use current month
const getDumpDate = () => {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    // Format: 2026-01
    return args[0];
  }
  // Default to current month
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Parse dump date to get year and month
const parseDumpDate = (dumpDate) => {
  const [year, month] = dumpDate.split('-');
  return { year, month };
};

// Download file from URL
async function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${url}`);
    console.log(`📁 Saving to: ${filePath}`);

    const file = createWriteStream(filePath);
    let downloadedBytes = 0;
    let totalBytes = 0;

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        return downloadFile(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
        return;
      }

      totalBytes = parseInt(response.headers['content-length'] || '0', 10);
      const startTime = Date.now();

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = downloadedBytes / elapsed;
        const remaining = totalBytes - downloadedBytes;
        const eta = remaining / speed;

        if (downloadedBytes % (100 * 1024 * 1024) < chunk.length) {
          // Log every 100MB
          const percent = totalBytes > 0 ? ((downloadedBytes / totalBytes) * 100).toFixed(2) : '?';
          const downloadedMB = (downloadedBytes / (1024 * 1024)).toFixed(2);
          const totalMB = totalBytes > 0 ? (totalBytes / (1024 * 1024)).toFixed(2) : '?';
          const speedMB = (speed / (1024 * 1024)).toFixed(2);
          const etaMin = Math.floor(eta / 60);
          const etaSec = Math.floor(eta % 60);
          console.log(`   Progress: ${downloadedMB}MB / ${totalMB}MB (${percent}%) - ${speedMB}MB/s - ETA: ${etaMin}m ${etaSec}s`);
        }
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✅ Download complete: ${(downloadedBytes / (1024 * 1024)).toFixed(2)}MB`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

// Decompress .gz file
async function decompressFile(gzPath, xmlPath) {
  console.log(`📦 Decompressing: ${path.basename(gzPath)}`);
  const startTime = Date.now();

  const readStream = fs.createReadStream(gzPath);
  const writeStream = fs.createWriteStream(xmlPath);
  const gunzip = createGunzip();

  await pipeline(readStream, gunzip, writeStream);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const sizeMB = (fs.statSync(xmlPath).size / (1024 * 1024)).toFixed(2);
  console.log(`✅ Decompression complete: ${sizeMB}MB in ${elapsed}s`);
}

// Main download function
async function downloadDiscogsArtists() {
  const dumpDate = getDumpDate();
  const { year, month } = parseDumpDate(dumpDate);

  console.log(`\n🎵 Discogs Artists Download`);
  console.log(`📅 Dump Date: ${dumpDate}\n`);

  // Create data directory if it doesn't exist
  const dataDir = path.join(__dirname, '..', 'data', 'discogs');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log(`📁 Created data directory: ${dataDir}`);
  }

  // File names
  const gzFileName = `discogs_${year}${month}01_artists.xml.gz`;
  const xmlFileName = `discogs_${year}${month}01_artists.xml`;
  const gzPath = path.join(dataDir, gzFileName);
  const xmlPath = path.join(dataDir, xmlFileName);

  // Check if already downloaded
  if (fs.existsSync(xmlPath)) {
    console.log(`✅ File already exists: ${xmlFileName}`);
    console.log(`   Skipping download. Delete the file to re-download.\n`);
    return { dumpDate, xmlPath };
  }

  // Create or update DiscogsDataSync record
  let syncRecord = await prisma.discogsDataSync.findUnique({
    where: { dumpDate },
  });

  if (!syncRecord) {
    syncRecord = await prisma.discogsDataSync.create({
      data: {
        dumpDate,
        status: 'downloading',
        startedAt: new Date(),
      },
    });
  } else {
    syncRecord = await prisma.discogsDataSync.update({
      where: { dumpDate },
      data: {
        status: 'downloading',
        startedAt: new Date(),
        error: null,
      },
    });
  }

  try {
    // Download URL
    const baseUrl = 'https://discogs-data-dumps.s3-us-west-2.amazonaws.com';
    const url = `${baseUrl}/data/${year}/${gzFileName}`;

    console.log(`🌐 URL: ${url}\n`);

    // Download .gz file
    await downloadFile(url, gzPath);

    // Update sync record
    await prisma.discogsDataSync.update({
      where: { dumpDate },
      data: {
        artistsFile: gzFileName,
      },
    });

    // Decompress
    await decompressFile(gzPath, xmlPath);

    // Delete .gz file to save space
    fs.unlinkSync(gzPath);
    console.log(`🗑️  Deleted compressed file to save space\n`);

    // Update sync record
    await prisma.discogsDataSync.update({
      where: { dumpDate },
      data: {
        status: 'processing',
      },
    });

    console.log(`✅ Download and decompression complete!`);
    console.log(`📁 File: ${xmlPath}\n`);

    return { dumpDate, xmlPath };
  } catch (error) {
    console.error(`❌ Error downloading:`, error);
    await prisma.discogsDataSync.update({
      where: { dumpDate },
      data: {
        status: 'failed',
        error: error.message,
      },
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1]?.includes('download-discogs-artists.js')) {
  downloadDiscogsArtists()
    .then(({ dumpDate, xmlPath }) => {
      console.log(`\n✅ Ready to process: ${xmlPath}`);
      console.log(`   Run: npm run discogs:process:artists -- ${dumpDate}\n`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { downloadDiscogsArtists };
