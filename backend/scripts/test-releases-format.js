import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test with sample file first
const testFile = path.join(__dirname, '..', '..', 'sample_releases.xml');

console.log('Testing releases XML format...\n');

const fileStream = fs.createReadStream(testFile);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity,
});

let lineNum = 0;
let releaseCount = 0;
let inRelease = false;
let releaseStartLine = 0;
let releaseBuffer = '';

for await (const line of rl) {
  lineNum++;
  
  // Check if line contains release start
  if (line.includes('<release')) {
    inRelease = true;
    releaseStartLine = lineNum;
    releaseBuffer = line;
    
    // Check if it's a complete release on one line
    if (line.includes('</release>')) {
      releaseCount++;
      console.log(`Release #${releaseCount} - COMPLETE ON ONE LINE (line ${lineNum})`);
      console.log(`   Length: ${line.length} chars`);
      console.log(`   Preview: ${line.substring(0, 100)}...\n`);
      inRelease = false;
      releaseBuffer = '';
    }
  } else if (inRelease) {
    // Continue buffering
    releaseBuffer += line;
    
    // Check if release ends on this line
    if (line.includes('</release>')) {
      releaseCount++;
      console.log(`Release #${releaseCount} - SPANS MULTIPLE LINES (lines ${releaseStartLine}-${lineNum})`);
      console.log(`   Total length: ${releaseBuffer.length} chars`);
      console.log(`   Preview: ${releaseBuffer.substring(0, 100)}...\n`);
      inRelease = false;
      releaseBuffer = '';
    }
  }
  
  // Stop after checking first 3 releases
  if (releaseCount >= 3) {
    break;
  }
}

console.log(`\nSummary: Checked ${lineNum} lines, found ${releaseCount} releases`);
console.log(`If releases span multiple lines, we'll need to buffer them.`);
