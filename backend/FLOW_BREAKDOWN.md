# Discogs Processing Scripts - Detailed Flow Breakdown

## Artist Processing Script (`process-discogs-artists.js`)

### Initialization Phase
1. **Get dump date** (line 12-36)
   - Check command line args for dump date (e.g., "2026-01")
   - If not provided, scan `data/discogs/` for latest `discogs_*_artists.xml` file
   - Extract date from filename pattern: `discogs_YYYYMMDD_artists.xml` → `YYYY-MM`

2. **Find XML file** (line 54-62)
   - Construct path: `data/discogs/discogs_YYYYMM01_artists.xml`
   - Verify file exists, throw error if not found

3. **Get/create sync record** (line 64-95)
   - Query `DiscogsDataSync` table by `dumpDate`
   - If new dump: create record with `status: 'processing'`, `startedAt: now()`
   - If existing: update status to 'processing', log previously processed count
   - This tracks progress across script runs

4. **Initialize counters and state** (line 100-120)
   - `processed = 0` (total artists processed)
   - `created = 0` (new artists created)
   - `updated = 0` (existing artists updated)
   - `skipped = 0` (artists skipped - no profile)
   - `errors = 0` (processing errors)
   - `isProcessing = false` (lock flag for sequential processing)
   - `lastSyncUpdate = 0` (track when to update sync record)
   - Timing metrics: `startTime`, `totalProcessingTime`, `slowestArtistTime`, `slowestArtistName`

5. **Create SAX parser** (line 122-130)
   - Stream-based XML parser (handles large files without loading into memory)
   - Set `strict: false` for lenient parsing
   - Initialize `elementStack = []` to track XML hierarchy
   - Initialize `currentArtist = null` to hold current artist data

### XML Parsing Phase

6. **Open file stream** (line 132-140)
   - Create read stream from XML file
   - Pipe to parser
   - Set up error handlers

7. **Handle opening tags** (`parser.onopentag`) (line 142-199)
   - Push tag name to `elementStack`
   - Set `currentElement = tagName`
   - When `<artist>` tag opens:
     - Create new `currentArtist` object with empty arrays/objects
     - Initialize: `id`, `name`, `realname`, `profile`, `dataQuality`, `urls`, `nameVariations`, `aliases`, `members`, `groups`
   - When `<namevariations>`, `<aliases>`, `<members>`, `<groups>` open:
     - Initialize empty arrays
   - When `<urls>` opens:
     - Initialize empty array
   - When nested tags open (e.g., `<name>` inside `<aliases>`):
     - Create new object in appropriate array

8. **Handle text content** (`parser.ontext`) (line 202-235)
   - Check `currentArtist` exists
   - Get parent element from `elementStack`
   - Append text to appropriate field based on current element and parent:
     - `<id>` inside `<artist>` → `currentArtist.id`
     - `<name>` inside `<artist>` → `currentArtist.name`
     - `<realname>` inside `<artist>` → `currentArtist.realname`
     - `<profile>` inside `<artist>` → `currentArtist.profile` (append, not trim - can be multi-line)
     - `<data_quality>` inside `<artist>` → `currentArtist.dataQuality`
     - `<name>` inside `<namevariations>` → append to `currentText` (handled on close)
     - `<name>` inside `<aliases>` → append to last alias object
     - `<name>` inside `<members>` → append to last member object
     - `<name>` inside `<groups>` → append to last group object
     - `<url>` inside `<urls>` → append to `currentText`

9. **Handle closing tags** (`parser.onclosetag`) (line 238-395)
   - When `</artist>` tag closes:
     - **CRITICAL**: Immediately extract ALL data from `currentArtist` into local constants
       - `artistName`, `discogsId`, `realname`, `profile`, `dataQuality`, `urls`, `nameVariations`, `aliases`, `members`, `groups`
     - Set `currentArtist = null` (prevents race conditions)
     - **Validate**: Check `artistName` exists, if not: log error, increment `errors`, return
     - **Skip check**: If `profile` is empty/null, increment `skipped`, return (don't process)
     - **Acquire lock**: Wait in loop while `isProcessing === true` (ensures sequential processing)
     - Set `isProcessing = true` (acquire lock)
     - Increment `processed++`
     - Set `shouldLog = (processed % 100 === 0)` (log every 100 artists)
     - Start timing: `artistStartTime = Date.now()`
     - **Prepare data object** with all artist fields
     - **Check existence**: Query `DiscogsArtist.findUnique({ where: { name } })` to see if artist exists
     - **Upsert artist**:
       - `DiscogsArtist.upsert({ where: { name }, update: {...}, create: {...} })`
       - If `existingArtist` was null: increment `created`
       - If `existingArtist` existed: increment `updated` and `skipped`
     - **Update sync record** (every 1000 artists):
       - `DiscogsDataSync.update({ artistsProcessed: processed })`
     - **Track timing**: Calculate `artistProcessingTime`, update `totalProcessingTime`, track slowest
     - **Log progress** (if `shouldLog`): Log stats every 100 artists
     - **Release lock**: Set `isProcessing = false` in `finally` block
   - When other tags close:
     - Pop from `elementStack`
     - Handle nested structures (namevariations, aliases, etc.)

### Completion Phase

10. **Handle parser end** (`parser.onend`) (line 397-430)
    - Calculate total elapsed time
    - **Update sync record**:
      - Set `status: 'completed'`
      - Set `artistsProcessed: processed`
      - Set `completedAt: now()`
    - **Log final summary**:
      - Total processed, created, updated, skipped, errors
      - Total time, DB processing time, average time per artist
      - Slowest artist name and time
    - Close Prisma connection

11. **Error handling** (line 432-440)
    - On stream error: log and update sync record with error
    - On parser error: log and update sync record with error
    - Always close Prisma connection in `finally`

---

## Release Processing Script (`process-discogs-releases.js`)

### Initialization Phase
1. **Check debug mode** (line 13)
   - Check if `--debug` flag in `process.argv`
   - If true: only process first 3 releases

2. **Get dump date** (line 15-39)
   - Same as artist script, but looks for `discogs_*_releases.xml` files

3. **Find XML file** (line 67-75)
   - Construct path: `data/discogs/discogs_YYYYMM01_releases.xml`
   - Verify file exists

4. **Get/create sync record** (line 77-110)
   - Same pattern as artist script
   - Tracks: `releasesProcessed`, `tracksProcessed`, `songsUpserted`

5. **Initialize counters and state** (line 112-130)
   - `processed = 0` (releases processed)
   - `created = 0` (new releases created)
   - `updated = 0` (existing releases updated)
   - `skipped = 0` (releases skipped)
   - `tracksProcessed = 0` (total tracks processed)
   - `songsUpserted = 0` (songs created/updated)
   - `errors = 0`
   - `isProcessing = false` (lock flag)
   - `lastSyncUpdate = 0`
   - Timing metrics
   - `debugRecords = []` (for debug mode)

6. **Create SAX parser** (line 132-150)
   - Same as artist script
   - Initialize `currentRelease = null`, `currentTrack = null`

### XML Parsing Phase

7. **Open file stream** (line 152-160)
   - Same pattern as artist script

8. **Handle opening tags** (`parser.onopentag`) (line 162-242)
   - When `<release>` opens:
     - Create `currentRelease` object with:
       - `id`, `title`, `status`, `genres[]`, `styles[]`, `released`, `dataQuality`, `masterId`, `country`
       - `artists[]`, `tracks[]`, `videos[]`, `extraArtists[]`
   - When `<artist>` inside `<artists>` opens:
     - Create artist object `{ id, name }`, add to `currentRelease.artists[]`
   - When `<track>` opens:
     - Create `currentTrack` object with:
       - `position`, `title`, `duration`, `artists[]`, `extraArtists[]`
   - When `<artist>` inside `<track>` opens:
     - Create artist object, add to `currentTrack.artists[]`
   - When `<video>` opens:
     - Create video object `{ src, duration, title }`, add to `currentRelease.videos[]`

9. **Handle text content** (`parser.ontext`) (line 244-315)
   - Append text to appropriate fields based on element and parent:
     - `<title>` inside `<release>` → `currentRelease.title`
     - `<genre>` → `currentRelease.genres[]`
     - `<style>` → `currentRelease.styles[]`
     - `<released>` → `currentRelease.released`
     - `<data_quality>` → `currentRelease.dataQuality`
     - `<master_id>` → `currentRelease.masterId`
     - `<country>` → `currentRelease.country`
     - `<name>` inside `<artist>` inside `<artists>` → last artist's name
     - `<id>` inside `<artist>` inside `<artists>` → last artist's id
     - `<name>` inside `<artist>` inside `<track>` → last track artist's name
     - `<id>` inside `<artist>` inside `<track>` → last track artist's id
     - `<position>` inside `<track>` → `currentTrack.position`
     - `<title>` inside `<track>` → `currentTrack.title`
     - `<duration>` inside `<track>` → `currentTrack.duration`
     - `<title>` inside `<video>` → last video's title

10. **Handle closing tags** (`parser.onclosetag`) (line 318-820)
    - When `</track>` closes:
      - Save track to `currentRelease.tracks[]`
      - Set `currentTrack = null`
    - When `</release>` closes:
      - **CRITICAL**: Extract ALL data from `currentRelease` into local constants
        - `releaseId`, `releaseTitle`, `releaseStatus`, `genres`, `styles`, `released`, `dataQuality`, `masterId`, `country`
        - `artists[]`, `tracks[]`, `videos[]`, `extraArtists[]`
      - Set `currentRelease = null`
      - **Validate**: Check `releaseId`, `releaseTitle`, `releaseStatus` exist
      - **Acquire lock**: Wait while `isProcessing === true`
      - Set `isProcessing = true`
      - Increment `processed++`
      - **Check debug mode**: If `isDebugMode && processed > 3`, set `isProcessing = false` and return
      - Start timing: `releaseStartTime = Date.now()`
      - **Process videos**: Extract YouTube IDs from video URLs
      - **Prepare release data object**
      - **Upsert release**:
        - `DiscogsRelease.upsert({ where: { id: releaseId }, update: {...}, create: {...} })`
        - Store `releaseUuid = result.id` (this is the database UUID, same as releaseId since it's the primary key)
        - Track `created` vs `updated`
      - **Process release artists** (lines 482-561):
        - Initialize `releaseArtistUuids = []` (to store UUIDs for later use)
        - Initialize `releaseArtistNames = artists.map(a => a.name.trim())` (for comparison with track artists)
        - For each artist in `artists[]`:
          - Extract `artistName = artist.name.trim()`
          - **Find artist by name**: `DiscogsArtist.findUnique({ where: { name: artistName } })`
          - **Auto-create if missing**:
            - `DiscogsArtist.create({ data: { name: artistName, lastUpdated: now() } })`
            - Minimal data: name only (artist processing script will update later)
          - **Store UUID**: Push `dbArtist.id` to `releaseArtistUuids[]`
          - **Create release-artist relationship**:
            - `DiscogsReleaseArtist.upsert({ where: { releaseId_artistId: { releaseId: releaseUuid, artistId: dbArtist.id } }, ... })`
      - **Process tracks** (lines 573-706):
        - For each track in `tracks[]`:
          - Skip if no `track.title`
          - Increment `tracksProcessed++`
          - **Get track artist names**: `trackArtistNames = track.artists.map(a => a.name.trim())`
          - **Get release artist names**: Already have `releaseArtistNames` from above
          - **Determine which artists to use**: 
            - If `trackArtistNames.length > 0`: use track artists
            - Otherwise: use release artists
          - **Create artist string**: `songArtist = songArtistNames.join(', ')`
          - **Get track artist string**: `trackArtistString = trackArtistNames.join(', ') || releaseArtistNames.join(', ')`
          - **Get release artist string**: `releaseArtistString = releaseArtistNames.join(', ')`
          - **Parse artist names** (comma-splitting logic):
            - If `trackArtistString === releaseArtistString`:
              - Treat as single artist (don't split): `artistNamesToProcess = [trackArtistString]`
            - Else if `trackArtistString` exists:
              - Split by comma: `artistNamesToProcess = trackArtistString.split(',').map(n => n.trim()).filter(Boolean)`
            - Else:
              - Use release artists: `artistNamesToProcess = releaseArtistNames`
          - **Get/create artist UUIDs**:
            - Initialize `trackArtistUuids = []`
            - For each `artistName` in `artistNamesToProcess`:
              - **Find artist**: `DiscogsArtist.findUnique({ where: { name: artistName } })`
              - **Auto-create if missing**:
                - `DiscogsArtist.create({ data: { name: artistName, lastUpdated: now() } })`
                - Minimal data: name only
              - Push `dbArtist.id` to `trackArtistUuids[]`
          - **Match YouTube video** (by title similarity):
            - Search `videos[]` for matching title
          - **Prepare song data**:
            - `title`, `artist` (comma-separated string), `youtubeId`, `duration`
            - `discogsReleaseId: releaseUuid`
            - `discogsTrackPosition: track.position`
            - `artistIds: trackArtistUuids` (array of UUIDs, not Discogs IDs!)
            - Other discogs metadata fields
          - **Find existing song**:
            - First by `youtubeId` (unique constraint)
            - Then by `title + artist`
            - Then by `discogsReleaseId + discogsTrackPosition`
          - **Upsert song**:
            - If exists: `Song.update({ where: { id }, data: {...} })`
            - If new: `Song.create({ data: songData })`
            - Increment `songsUpserted++`
      - **Update sync record** (every 1000 releases):
        - `DiscogsDataSync.update({ releasesProcessed: processed, tracksProcessed, songsUpserted })`
      - **Track timing**: Calculate processing time, update totals, track slowest
      - **Log progress** (every 100 releases or first 10):
        - Log release title, track count, artist count
      - **Release lock**: Set `isProcessing = false` in `finally` block

### Completion Phase

11. **Handle parser end** (`parser.onend`) (line 822-890)
    - Calculate total elapsed time
    - **Update sync record**:
      - Set `status: 'completed'`
      - Set `releasesProcessed`, `tracksProcessed`, `songsUpserted`
      - Set `completedAt: now()`
    - **Log final summary**:
      - Total releases, tracks, songs
      - Created, updated, skipped, errors
      - Total time, DB processing time, average time per release
      - Slowest release title and time
    - **Debug mode**: Log first 3 expected records
    - Close Prisma connection

12. **Error handling** (line 892-900)
    - Same pattern as artist script

---

## Key Differences Between Scripts

### Artist Script
- Processes individual artists
- Skips artists without profiles
- Uses `name` as unique identifier (not Discogs ID)
- Simple: one artist = one database record

### Release Script
- Processes releases (which contain tracks)
- More complex: one release = one release record + multiple song records
- Auto-creates missing artists (minimal data)
- Handles comma-separated artist names with smart splitting logic
- Stores artist UUIDs (not Discogs IDs) in `Song.artistIds`
- Creates relationships: `DiscogsReleaseArtist` links releases to artists

## Sequential Processing Lock

Both scripts use `isProcessing` flag to ensure:
- Only one database operation happens at a time
- Prevents connection pool exhaustion
- Prevents memory issues from promise chains
- Ensures accurate progress tracking

The lock is acquired before incrementing `processed`, ensuring true sequential processing.
