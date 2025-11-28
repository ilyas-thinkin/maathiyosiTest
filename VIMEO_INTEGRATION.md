# Vimeo Course Integration - Complete Guide

## Overview
This document explains the Vimeo integration for hosting and managing course videos, similar to the existing Mux integration.

## Features

✅ **Vimeo Folder Organization** - Each course gets its own folder in Vimeo
✅ **Automatic Video Upload** - Videos uploaded directly from the admin panel
✅ **Progress Tracking** - Real-time upload progress for each lesson
✅ **Database Integration** - Courses stored in `courses_vimeo` and `course_lessons_vimeo` tables
✅ **TUS Protocol** - Uses Vimeo's preferred upload protocol for reliability
✅ **Video Management** - Delete videos and folders when course is removed

## Database Schema

### courses_vimeo Table
```sql
CREATE TABLE courses_vimeo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC,
  thumbnail_url TEXT,
  vimeo_folder_id TEXT,
  vimeo_folder_uri TEXT
);
```

### course_lessons_vimeo Table
```sql
CREATE TABLE course_lessons_vimeo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  course_id UUID REFERENCES courses_vimeo(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  vimeo_video_id TEXT,
  vimeo_video_uri TEXT,
  vimeo_player_url TEXT,
  duration INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0
);
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Vimeo API Configuration
VIMEO_ACCESS_TOKEN=your_vimeo_access_token_here
VIMEO_API_BASE_URL=https://api.vimeo.com
VIMEO_CLIENT_ID=your_client_id_here
VIMEO_CLIENT_SECRET=your_client_secret_here

# Optional (for OAuth flow)
VIMEO_AUTHORIZE_URL=https://api.vimeo.com/oauth/authorize
VIMEO_ACCESS__TOKEN_URL=https://api.vimeo.com/oauth/access_token
```

### How to Get Vimeo Credentials

1. **Create a Vimeo Account** (or use existing)
   - Go to https://vimeo.com
   - Sign up or log in

2. **Create a Vimeo App**
   - Go to https://developer.vimeo.com/apps
   - Click "Create App"
   - Fill in app details
   - Save the app

3. **Generate Access Token**
   - Open your app in the Vimeo Developer portal
   - Go to "Authentication" tab
   - Generate a new access token with these scopes:
     - `upload` - Upload videos
     - `create` - Create folders/projects
     - `delete` - Delete videos and folders
     - `edit` - Edit video details
   - Copy the access token and save it to your `.env.local`

4. **Get Client ID and Secret**
   - In your Vimeo app page
   - Find "Client Identifier" and "Client Secret"
   - Copy both to your `.env.local`

## Files Created

### API Endpoints

1. **`/api/vimeo/create-folder`** - Creates a new folder (project) in Vimeo
   ```typescript
   POST /api/vimeo/create-folder
   Body: { folderName: string }
   Response: { folderId, folderUri, folderName }
   ```

2. **`/api/vimeo/create-upload`** - Creates a video upload URL
   ```typescript
   POST /api/vimeo/create-upload
   Body: { fileName: string, fileSize: number, folderId?: string }
   Response: { uploadUrl, videoUri, playerEmbedUrl, link }
   ```

3. **`/api/vimeo/get-video`** - Gets video details
   ```typescript
   GET /api/vimeo/get-video?videoId=123456
   Response: { videoId, name, link, playerEmbedUrl, duration, status }
   ```

4. **`/api/vimeo/delete-video`** - Deletes a video
   ```typescript
   DELETE /api/vimeo/delete-video?videoId=123456
   Response: { success: true }
   ```

### Admin API Endpoints

1. **`/api/admin/create-vimeo-course`** - Creates a course with lessons
   ```typescript
   POST /api/admin/create-vimeo-course
   Body: {
     title, description, category, price,
     thumbnail_url, vimeo_folder_id, vimeo_folder_uri,
     lessons: [{ title, description, vimeo_video_id, ... }]
   }
   ```

2. **`/api/admin/fetch-vimeo-courses`** - Fetches all Vimeo courses
   ```typescript
   GET /api/admin/fetch-vimeo-courses
   Response: { success: true, data: Course[] }
   ```

3. **`/api/admin/delete-vimeo-course`** - Deletes course, lessons, and videos
   ```typescript
   DELETE /api/admin/delete-vimeo-course?id=course-uuid
   Response: { success: true, message: "..." }
   ```

### UI Components

1. **`/components/vimeo-courseuploader/page.tsx`** - Main upload interface
   - Drag-and-drop lesson reordering
   - Real-time upload progress
   - Thumbnail upload
   - Course metadata fields

2. **`/components/lib/vimeoClient.ts`** - Vimeo API utility functions
   - `createVimeoFolder()`
   - `createVimeoUpload()`
   - `getVimeoVideo()`
   - `deleteVimeoVideo()`
   - `deleteVimeoFolder()`

## How to Use

### 1. Upload a New Vimeo Course

1. **Go to Admin Page**
   ```
   http://localhost:3000/admin-page
   ```

2. **Click "Add Vimeo Course" button** (purple button on the right)

3. **Fill in Course Details**
   - Course Title
   - Description
   - Category
   - Price
   - Thumbnail image

4. **Add Lessons**
   - Click "Add Lesson" button
   - Fill in lesson title
   - Add description (optional)
   - Upload video file

5. **Reorder Lessons** (optional)
   - Drag lessons up/down using the grip handle

6. **Upload Course**
   - Click "Upload Course to Vimeo"
   - Wait for upload to complete
   - Monitor progress in real-time

### 2. Upload Process Flow

```
User clicks "Upload Course to Vimeo"
  ↓
1. Upload thumbnail to your storage
  ↓
2. Create Vimeo folder (named after course title)
  ↓
3. For each lesson:
   - Create Vimeo upload URL
   - Upload video using TUS protocol
   - Get video URI and player URL
  ↓
4. Save course to courses_vimeo table
  ↓
5. Save lessons to course_lessons_vimeo table
  ↓
Done! Redirect to admin page
```

### 3. Video Upload Details

The system uses **TUS protocol** (Vimeo's preferred method):
- Resumable uploads
- Better for large files
- Progress tracking
- More reliable than standard uploads

## Architecture

### Vimeo Folder Structure

```
Vimeo Account
└── Projects/Folders
    ├── Course Title 1/
    │   ├── Lesson 1 - Introduction.mp4
    │   ├── Lesson 2 - Getting Started.mp4
    │   └── Lesson 3 - Advanced Topics.mp4
    ├── Course Title 2/
    │   ├── Lesson 1 - Basics.mp4
    │   └── Lesson 2 - Advanced.mp4
    └── ...
```

Each course gets its own folder in Vimeo, making organization clean and manageable.

### Database Relationships

```
courses_vimeo (1)
    ↓
course_lessons_vimeo (many)
    ↓
Vimeo Videos (stored via URI and player URL)
```

## Comparison: Mux vs Vimeo

| Feature | Mux | Vimeo |
|---------|-----|-------|
| Upload Protocol | Direct Upload | TUS (Resumable) |
| Folder Organization | No | Yes (Projects) |
| Pricing | Per minute | Subscription tiers |
| Player | Mux Player | Vimeo Player |
| API Complexity | Simple | Moderate |
| Processing Speed | Fast | Moderate |

## Error Handling

The system handles these scenarios:

1. **Upload Fails** - Shows error message, doesn't create course
2. **Folder Creation Fails** - Stops process, shows error
3. **Partial Upload** - Can retry individual lessons
4. **Network Issues** - TUS protocol supports resumable uploads
5. **Database Errors** - Rolls back, deletes uploaded videos

## Troubleshooting

### "Failed to get Vimeo upload URL"
- Check `VIMEO_ACCESS_TOKEN` in `.env.local`
- Ensure token has `upload` scope
- Verify token hasn't expired

### "Upload failed with status 401"
- Invalid access token
- Regenerate token in Vimeo Developer portal

### "Failed to create Vimeo folder"
- Check token has `create` scope
- Verify API base URL is correct

### Videos not appearing in Vimeo
- Wait a few minutes for processing
- Check Vimeo dashboard under Projects
- Verify folder was created successfully

## Testing

1. **Test with small video first** (< 50MB)
2. **Check Vimeo dashboard** to verify folder and videos
3. **Verify database entries** in Supabase
4. **Test course deletion** to ensure cleanup works

## Production Checklist

- [ ] Add Vimeo credentials to production environment
- [ ] Create database tables in production Supabase
- [ ] Test upload with production credentials
- [ ] Configure Vimeo privacy settings (private/public)
- [ ] Set up video embed domain restrictions (security)
- [ ] Test course deletion in production
- [ ] Monitor Vimeo storage quota

## Best Practices

1. **Video Naming** - Use descriptive lesson titles
2. **Folder Organization** - One folder per course
3. **Video Quality** - Upload high-quality source files
4. **Privacy** - Set appropriate privacy settings in Vimeo
5. **Cleanup** - Always delete unused videos to save storage

## Support

For issues:
- Check Vimeo API documentation: https://developer.vimeo.com/api/reference
- Review server logs for detailed error messages
- Verify environment variables are set correctly

## Future Enhancements

Possible additions:
- [ ] Video transcoding progress tracking
- [ ] Automatic thumbnail extraction from video
- [ ] Bulk upload for multiple lessons
- [ ] Video preview before upload
- [ ] Chapter/timestamp markers
- [ ] Subtitle/caption upload
- [ ] Analytics integration

---

## Quick Start Commands

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Add Vimeo credentials to .env.local
# (see Environment Variables section above)

# 3. Create database tables in Supabase
# (run the SQL from Database Schema section)

# 4. Start dev server
npm run dev

# 5. Go to admin page
# http://localhost:3000/admin-page

# 6. Click "Add Vimeo Course" button (purple)
```

That's it! You're ready to upload courses to Vimeo! 🎉
