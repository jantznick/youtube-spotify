import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearHomePageFeed() {
  try {
    console.log('Clearing all HomePageFeed entries...');
    const result = await prisma.homePageFeed.deleteMany({});
    console.log(`✅ Deleted ${result.count} entries`);
  } catch (error) {
    console.error('Error clearing feed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

clearHomePageFeed()
  .then(() => {
    console.log('Done');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
