# 🚀 Vimeo Course Integration - Quick Start

## ✅ What's Been Created

I've built a complete Vimeo course management system for your platform, mirroring your existing Mux implementation.

### New Files Created:

#### **API Endpoints** (7 files)
1. `/api/vimeo/create-upload/route.ts` - Create video upload URL
2. `/api/vimeo/create-folder/route.ts` - Create course folder in Vimeo
3. `/api/vimeo/get-video/route.ts` - Get video details
4. `/api/vimeo/delete-video/route.ts` - Delete video from Vimeo
5. `/api/admin/create-vimeo-course/route.ts` - Create course in database
6. `/api/admin/fetch-vimeo-courses/route.ts` - Fetch all Vimeo courses
7. `/api/admin/delete-vimeo-course/route.ts` - Delete course + videos

#### **UI Components** (1 file)
1. `/components/vimeo-courseuploader/page.tsx` - Beautiful upload interface with progress tracking

#### **Utilities** (1 file)
1. `/components/lib/vimeoClient.ts` - Vimeo API helper functions

#### **Documentation** (3 files)
1. `VIMEO_INTEGRATION.md` - Complete documentation
2. `VIMEO_QUICK_START.md` - This file
3. `create-vimeo-tables.sql` - Database schema

#### **Updates**
1. `admin-page/page.tsx` - Added "Add Vimeo Course" button (purple)

---

## 🎯 How It Works

### Course Upload Flow:

```
1. Admin clicks "Add Vimeo Course" button
   ↓
2. Fills in course details (title, description, category, price)
   ↓
3. Uploads thumbnail image
   ↓
4. Adds lessons with titles, descriptions, and video files
   ↓
5. Clicks "Upload Course to Vimeo"
   ↓
6. System creates Vimeo folder named after course
   ↓
7. Uploads all videos to that folder using TUS protocol
   ↓
8. Saves course and lessons to database
   ↓
9. Done! ✅
```

### Key Features:

✅ **Folder Organization** - Each course gets its own Vimeo folder
✅ **Real-time Progress** - See upload progress for each lesson
✅ **Drag & Drop** - Reorder lessons before uploading
✅ **TUS Protocol** - Resumable uploads for large files
✅ **Auto Cleanup** - Deleting a course also deletes all Vimeo videos

---

## 📋 Setup Steps

### 1. Create Database Tables

Run this in your **Supabase SQL Editor**:

```bash
# Open the file:
create-vimeo-tables.sql

# Copy all contents and paste into Supabase SQL Editor
# Click "Run"
```

### 2. Add Vimeo Credentials

Add these to your `.env.local` file:

```env
# Vimeo API Configuration
VIMEO_ACCESS_TOKEN=your_vimeo_access_token_here
VIMEO_API_BASE_URL=https://api.vimeo.com
VIMEO_CLIENT_ID=your_client_id_here
VIMEO_CLIENT_SECRET=your_client_secret_here
```

#### How to Get Credentials:

1. Go to https://developer.vimeo.com/apps
2. Create a new app (or use existing)
3. Go to Authentication tab
4. Generate access token with these scopes:
   - ✅ `upload`
   - ✅ `create`
   - ✅ `delete`
   - ✅ `edit`
5. Copy token to `.env.local`
6. Copy Client ID and Client Secret from app page

### 3. Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Start again
npm run dev
```

---

## 🎨 How to Use

### Upload a Course:

1. **Navigate to Admin Page**
   ```
   http://localhost:3000/admin-page
   ```

2. **Click "Add Vimeo Course"** (purple button on right side)

3. **Fill Course Details:**
   - Course Title
   - Description
   - Category (e.g., "Programming", "Design")
   - Price (in ₹)
   - Thumbnail image

4. **Add Lessons:**
   - Click "+ Add Lesson"
   - Enter lesson title
   - Add description (optional)
   - Upload video file
   - Repeat for all lessons

5. **Reorder (Optional):**
   - Drag lessons up/down using the grip handle icon
   - Final order will be preserved

6. **Upload:**
   - Click "🚀 Upload Course to Vimeo"
   - Wait for progress to complete
   - Don't close the browser during upload!

---

## 📊 What Gets Created

### In Vimeo:
```
Your Vimeo Account
└── Projects/Folders
    └── [Course Title]/
        ├── Lesson 1 Video.mp4
        ├── Lesson 2 Video.mp4
        └── Lesson 3 Video.mp4
```

### In Database (Supabase):
```
courses_vimeo table:
- Course ID
- Title, Description, Category, Price
- Thumbnail URL
- Vimeo Folder ID

course_lessons_vimeo table:
- Lesson ID
- Course ID (foreign key)
- Title, Description
- Vimeo Video ID
- Vimeo Player URL
- Order Index
```

---

## 🔧 Troubleshooting

### "Failed to get Vimeo upload URL"
**Fix:** Check your `VIMEO_ACCESS_TOKEN` in `.env.local`

### "Upload failed with status 401"
**Fix:** Regenerate your Vimeo access token with correct scopes

### "Failed to create Vimeo folder"
**Fix:** Ensure token has `create` scope enabled

### Videos not showing in Vimeo
**Fix:** Wait a few minutes for Vimeo to process videos, then check Projects section

### Upload stuck at "Uploading..."
**Fix:** Check your internet connection and browser console for errors

---

## 🎯 Testing Checklist

- [ ] Database tables created in Supabase
- [ ] Vimeo credentials added to `.env.local`
- [ ] Dev server restarted
- [ ] Can access `/admin-page`
- [ ] Purple "Add Vimeo Course" button visible
- [ ] Course upload page loads
- [ ] Can add lessons
- [ ] Can drag-reorder lessons
- [ ] Upload completes successfully
- [ ] Course visible in Vimeo dashboard
- [ ] Course saved in Supabase

---

## 📸 UI Preview

The upload page features:
- 🎨 Beautiful gradient design matching your Mux uploader
- 📊 Real-time progress bar with percentage
- 🎬 Lesson-by-lesson upload status
- 🔄 Drag & drop reordering
- ✅ Success indicators
- ⚡ Responsive design

---

## 🚀 Production Deployment

When deploying to production:

1. ✅ Add Vimeo credentials to production environment variables
2. ✅ Run `create-vimeo-tables.sql` in production Supabase
3. ✅ Test with a small course first
4. ✅ Configure Vimeo privacy settings (public/private)
5. ✅ Monitor Vimeo storage quota

---

## 📚 Additional Resources

- **Full Documentation:** `VIMEO_INTEGRATION.md`
- **Vimeo API Docs:** https://developer.vimeo.com/api/reference
- **TUS Protocol:** https://tus.io/

---

## ✨ Next Steps

You're all set! Here's what you can do now:

1. ✅ Set up Vimeo credentials
2. ✅ Create database tables
3. ✅ Upload your first course
4. ✅ Test course deletion
5. ✅ Deploy to production

Happy uploading! 🎉

---

**Need Help?**
Check the detailed documentation in `VIMEO_INTEGRATION.md` or review the error messages in the browser console.
