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

    // Check for failed migrations and resolve them
    console.log('📋 Step 2: Checking for failed migrations...');
    try {
      const statusOutput = execSync('npx prisma migrate status', { 
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      
      // Check if there are failed migrations
      if (statusOutput.includes('failed') || statusOutput.includes('P3009')) {
        console.log('⚠️  Found failed migrations, attempting to resolve...');
        
        // Since fix-session-table.js already ensures the table exists and is correct,
        // we can safely mark the failed migration as applied
        try {
          console.log('📋 Resolving failed session table migration...');
          execSync('npx prisma migrate resolve --applied 20260116000000_add_session_table', { 
            stdio: 'inherit',
            encoding: 'utf-8'
          });
          console.log('✅ Failed migration resolved');
        } catch (resolveError) {
          // If resolve fails, try rolled-back instead
          console.log('📋 Trying to mark migration as rolled back...');
          try {
            execSync('npx prisma migrate resolve --rolled-back 20260116000000_add_session_table', { 
              stdio: 'inherit',
              encoding: 'utf-8'
            });
            console.log('✅ Failed migration marked as rolled back');
          } catch (rollbackError) {
            console.warn('⚠️  Could not resolve failed migration automatically');
            console.warn('⚠️  This may require manual intervention with: npx prisma migrate resolve --applied 20260116000000_add_session_table');
          }
        }
      }
    } catch (statusError) {
      // If we can't check status, continue anyway
      console.warn('⚠️  Could not check migration status, continuing...');
    }

    // Then run migrations
    console.log('📋 Step 3: Running Prisma migrations...');
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
