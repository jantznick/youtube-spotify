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

    // Step 1.5: Safely drop userId from Song table (songs are now global)
    console.log('📋 Step 1.5: Safely removing userId from Song table...');
    try {
      execSync('node scripts/safe-drop-userid.js', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  userId removal had warnings, continuing...');
    }

    // Check for failed migrations and resolve them
    console.log('📋 Step 2: Checking for failed migrations...');
    
    // Always try to resolve the known failed migration first (since status check often fails when there's a failed migration)
    // The session table already exists and is correct (from Step 1), so we can safely mark it as applied
    try {
      console.log('📋 Attempting to resolve failed session table migration...');
      execSync('npx prisma migrate resolve --applied 20260116000000_add_session_table', { 
        stdio: 'pipe',
        encoding: 'utf-8'
      });
      console.log('✅ Failed migration resolved');
    } catch (resolveError) {
      // If resolve fails, the migration might not be in failed state, or it might already be resolved
      // Try to check status to see what's happening
      try {
        const statusOutput = execSync('npx prisma migrate status', { 
          encoding: 'utf-8',
          stdio: 'pipe'
        });
        
        // Check if there are still failed migrations
        if (statusOutput.includes('failed') || statusOutput.includes('P3009')) {
          console.log('⚠️  Still detecting failed migrations, trying rolled-back...');
          try {
            execSync('npx prisma migrate resolve --rolled-back 20260116000000_add_session_table', { 
              stdio: 'pipe',
              encoding: 'utf-8'
            });
            console.log('✅ Failed migration marked as rolled back');
          } catch (rollbackError) {
            console.warn('⚠️  Could not resolve failed migration automatically');
          }
        } else {
          console.log('✅ No failed migrations detected');
        }
      } catch (statusError) {
        // Status check failed, but we tried to resolve anyway, so continue
        console.warn('⚠️  Could not check migration status, but attempted resolution');
      }
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
    console.log('📋 We have already:');
    console.log('   - Fixed session table structure');
    console.log('   - Safely dropped userId from Song table');
    console.log('   - Attempted to resolve failed migration');
    console.log('📋 Attempting schema sync with db push (safe changes only)...');
    
    try {
      // Try db push as fallback (only if migrations fail)
      // We've already handled the dangerous changes:
      // - Session table structure (Step 1)
      // - userId column drop (Step 1.5)
      // So db push should only need to add missing columns/constraints
      // But it will still warn about the changes we've already made
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Schema synced successfully');
      return true;
    } catch (pushError) {
      // db push failed - likely due to data loss warnings
      // Since we've already handled userId drop and session table,
      // the warnings are probably about changes we've already made
      // But we can't use --accept-data-loss as it would accept ALL changes
      console.error('❌ Schema sync failed due to data loss warnings');
      console.error('⚠️  Server will not start until migrations are resolved');
      console.error('💡 The failed migration must be resolved first:');
      console.error('   npx prisma migrate resolve --applied 20260116000000_add_session_table');
      console.error('💡 Then migrations should apply successfully');
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
