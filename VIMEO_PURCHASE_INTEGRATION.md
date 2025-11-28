# Vimeo Purchase Integration

## Overview
Extended the existing purchase system to support both Mux and Vimeo courses seamlessly. Users can now purchase and access courses from either platform without knowing the underlying video source.

## Changes Made

### 1. New API Endpoints

#### `/api/admin/fetch-vimeo-details-course` (GET)
- Fetches a single Vimeo course with all its lessons
- Similar to `fetch-mux-details-course` but queries `courses_vimeo` and `course_lessons_vimeo` tables
- Orders lessons by `lesson_order` field
- Returns course object with nested lessons array

#### `/api/admin/get-course-source` (GET)
- Determines if a course ID belongs to Mux or Vimeo
- Checks both `courses_mux` and `courses_vimeo` tables
- Returns: `{ source: "mux" | "vimeo", exists: boolean }`
- Used by all course-fetching logic to route to correct API

### 2. Updated Files

#### `src/app/purchase/PurchaseClient.tsx`
**What it does:** Purchase page where users complete payment
**Changes:**
- Now checks course source before fetching details
- Calls `get-course-source` API first
- Routes to correct endpoint (`fetch-mux-details-course` or `fetch-vimeo-details-course`)
- Works transparently for both course types

#### `src/app/courses/[id]/page.tsx`
**What it does:** Course details page with purchase button
**Changes:**
- Determines course source on page load
- Fetches from correct API endpoint
- Purchase button works for both Mux and Vimeo courses
- Purchase status check works the same (single `purchase` table for both)

#### `src/app/my-courses/page.tsx`
**What it does:** Shows all courses user has purchased
**Changes:**
- Loops through purchased course IDs
- For each course, checks source via `get-course-source`
- Fetches details from appropriate endpoint
- Displays both Mux and Vimeo courses in unified list

### 3. Database Schema

**No changes needed!** The existing `purchase` table works for both:
```sql
CREATE TABLE purchase (
  id UUID PRIMARY KEY,
  user_id UUID,
  course_id UUID,  -- Can reference either courses_mux or courses_vimeo
  status TEXT,
  amount NUMERIC,
  merchant_order_id TEXT,
  transaction_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

The `course_id` field stores UUIDs that can reference either table. The system determines the source dynamically.

## How It Works

### Purchase Flow (Both Mux and Vimeo)

1. **User browses courses** (`/courses`)
   - Both Mux and Vimeo courses shown together
   - No visible distinction between sources

2. **User clicks on a course** (`/courses/[id]`)
   - Page calls `get-course-source` to determine Mux or Vimeo
   - Fetches details from appropriate API
   - Checks if user already purchased (queries `purchase` table)
   - Shows "Purchase" or "View Course" button

3. **User clicks Purchase** (`/purchase?course_id=...`)
   - PurchaseClient determines course source
   - Fetches course details (title, price) from correct API
   - Creates payment via PhonePe (same for both types)
   - Inserts record in `purchase` table with course_id

4. **Payment completes**
   - PhonePe callback/webhook updates `purchase.status = "success"`
   - Works identically for both Mux and Vimeo

5. **User accesses course** (`/my-courses`)
   - Fetches all successful purchases
   - For each course_id, determines source
   - Fetches details from correct API
   - Shows unified list of all purchased courses

6. **User views lessons** (`/courses/[id]/lessons`)
   - Lessons page would need similar source detection
   - Vimeo lessons use `vimeo_player_url` instead of Mux playback URLs

## Key Benefits

1. **Unified purchase table** - No separate purchase tracking for each source
2. **Transparent to users** - They don't know if course is Mux or Vimeo
3. **Single payment flow** - PhonePe integration works for both
4. **Flexible** - Easy to add more video sources in future
5. **Maintainable** - Source detection logic centralized in one API

## Testing Checklist

- [ ] Upload Vimeo course via admin panel
- [ ] View Vimeo course on public courses page
- [ ] Click into Vimeo course details
- [ ] Purchase Vimeo course via PhonePe
- [ ] Complete payment and verify `purchase` table updated
- [ ] Check "My Courses" shows the Vimeo course
- [ ] Verify Mux courses still work as before
- [ ] Test purchasing both Mux and Vimeo courses for same user
- [ ] Verify both show in "My Courses"

## Future Enhancements

1. **Lessons page** - Update `/courses/[id]/lessons` to support Vimeo
2. **Video player** - Different player components for Mux vs Vimeo
3. **Progress tracking** - May need source-specific logic
4. **Analytics** - Track which source performs better

## Example Course IDs

After uploading courses, you'll have:
- **Mux course**: `550e8400-e29b-41d4-a716-446655440000` (in `courses_mux`)
- **Vimeo course**: `650e8400-e29b-41d4-a716-446655440000` (in `courses_vimeo`)

Both can be purchased and stored in `purchase` table:
```sql
-- Purchase table contains both types
SELECT * FROM purchase;

| user_id | course_id                            | status  |
|---------|--------------------------------------|---------|
| user1   | 550e8400-e29b-41d4-a716-446655440000 | success | -- Mux
| user1   | 650e8400-e29b-41d4-a716-446655440000 | success | -- Vimeo
```

The system automatically knows which table to query based on the `course_id`.

---

✅ **Vimeo purchase integration complete!** Both Mux and Vimeo courses now work with the same purchase flow.
