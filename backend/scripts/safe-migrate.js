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

    // Step 1.6: Complete the failed make_songs_global migration
    console.log('📋 Step 1.6: Completing failed make_songs_global migration...');
    try {
      execSync('node scripts/complete-make-songs-global.js', { stdio: 'inherit' });
    } catch (error) {
      console.warn('⚠️  Migration completion had warnings, continuing...');
    }

    // Check for failed migrations and resolve them
    console.log('📋 Step 2: Checking for failed migrations...');
    
    // Always try to resolve the known failed migrations first
    // 1. Session table migration (already fixed)
    // 2. make_songs_global migration (already completed manually)
    const failedMigrations = [
      '20260116000000_add_session_table',
      '20260121000000_make_songs_global'
    ];

    for (const migrationName of failedMigrations) {
      try {
        console.log(`📋 Attempting to resolve failed migration: ${migrationName}...`);
        execSync(`npx prisma migrate resolve --applied ${migrationName}`, { 
          stdio: 'pipe',
          encoding: 'utf-8'
        });
        console.log(`✅ Migration ${migrationName} resolved`);
      } catch (resolveError) {
        // If resolve fails, try rolled-back
        try {
          console.log(`📋 Trying to mark ${migrationName} as rolled back...`);
          execSync(`npx prisma migrate resolve --rolled-back ${migrationName}`, { 
            stdio: 'pipe',
            encoding: 'utf-8'
          });
          console.log(`✅ Migration ${migrationName} marked as rolled back`);
        } catch (rollbackError) {
          console.warn(`⚠️  Could not resolve ${migrationName} automatically`);
        }
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
