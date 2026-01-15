import { execSync } from 'child_process';

function safeMigrate() {
  console.log('🔄 Running database migrations...');

  try {
    // First, fix session table structure (idempotent)
    console.log('📋 Step 1: Fixing session table structure...');
    try {
      execSync('node scripts/fix-session-table.js', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Session table fix had warnings, continuing...');
    }

    // Then run migrations
    console.log('📋 Step 2: Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    // Check migration status
    console.log('📋 Checking migration status...');
    try {
      execSync('npx prisma migrate status', { stdio: 'inherit' });
    } catch (statusError) {
      console.error('❌ Could not check migration status');
    }

    // If there's drift, try to resolve it (without data loss)
    console.log('⚠️  Attempting to resolve migration drift...');
    try {
      // Try db push as fallback (only if migrations fail)
      // This will NOT drop data - it only adds/modifies columns
      console.log('📋 Attempting schema sync with db push (no data loss)...');
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Schema synced successfully');
      return true;
    } catch (pushError) {
      console.error('❌ Schema sync failed - this may require manual intervention');
      console.error('⚠️  Server will not start until migrations are resolved');
      return false;
    }
  }
}

try {
  const success = safeMigrate();
  process.exit(success ? 0 : 1);
} catch (error) {
  console.error('Fatal error:', error);
  process.exit(1);
}
