# Vimeo Course Upload - Updated Simple Version

## ✅ What Changed

The Vimeo course uploader has been simplified to match your existing Mux/normal course upload style:

### Changes Made:

1. **Simplified UI** ✅
   - Removed drag-and-drop reordering (too complex)
   - Removed fancy progress bars
   - Simple form layout matching Mux uploader
   - Clean, minimalist design

2. **Document Upload Added** ✅
   - Each lesson can now have an optional document
   - Supports: PDF, DOC, DOCX, TXT, PPT, PPTX
   - Document URL saved in database

3. **Add Lesson Button Position** ✅
   - Button now appears at the bottom after all lessons
   - Clicking adds a new lesson form below the last one

## 📋 Updated Features

### Lesson Form Fields:
```
For each lesson:
├── Title (required)
├── Video File (required)
├── Document File (optional) ← NEW!
├── Description (optional)
└── Duration (optional)
```

### Upload Flow:
```
1. Upload thumbnail
   ↓
2. Create Vimeo folder
   ↓
3. For each lesson:
   - Upload video to Vimeo
   - Upload document (if provided)
   ↓
4. Save course to database
   ↓
Done!
```

## 📊 Database Schema Update

The `course_lessons_vimeo` table now includes:

```sql
CREATE TABLE course_lessons_vimeo (
  ...
  vimeo_video_id TEXT,
  vimeo_video_uri TEXT,
  vimeo_player_url TEXT,
  document_url TEXT,  -- ← NEW FIELD
  duration INTEGER DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  ...
);
```

## 🎨 UI Layout

```
┌─────────────────────────────────┐
│  Upload New Vimeo Course        │
├─────────────────────────────────┤
│  Course Title                   │
│  Course Description             │
│  Category                       │
│  Price                          │
│  Thumbnail Image                │
├─────────────────────────────────┤
│  Lessons                        │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Lesson 1 Title            │ │
│  │ Video File                │ │
│  │ Document (optional)       │ │  ← NEW!
│  │ Description (optional)    │ │
│  │ Duration (optional)       │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Lesson 2 Title            │ │
│  │ Video File                │ │
│  │ Document (optional)       │ │  ← NEW!
│  │ Description (optional)    │ │
│  │ Duration (optional)       │ │
│  └───────────────────────────┘ │
│                                 │
│  [+ Add Lesson]                │  ← At bottom
│                                 │
│  [Upload Vimeo Course]         │
└─────────────────────────────────┘
```

## 🔧 How to Use

### 1. Upload Course Details
- Fill in course title, description, category, price
- Upload thumbnail image

### 2. Add Lessons
- Click "+ Add Lesson" button (adds new lesson form at bottom)
- Fill in lesson title
- Upload video file
- (Optional) Upload document file
- (Optional) Add description and duration

### 3. Upload
- Click "Upload Vimeo Course" button
- Wait for upload to complete (spinner will show)
- Don't close browser during upload

## 📝 Example Use Case

**Course:** "Complete Python Programming"

**Lesson 1:**
- Title: "Introduction to Python"
- Video: intro.mp4
- Document: python-basics-slides.pdf ← Optional
- Description: "Learn Python basics"
- Duration: "15min"

**Lesson 2:**
- Title: "Variables and Data Types"
- Video: variables.mp4
- Document: variables-cheatsheet.pdf ← Optional
- Description: "Understanding Python variables"
- Duration: "20min"

## 🆚 Comparison: Old vs New

| Feature | Old Version | New Version |
|---------|-------------|-------------|
| UI Style | Fancy gradients | Simple forms |
| Progress | Detailed progress bar | Simple spinner |
| Drag & Drop | Yes | No (simpler) |
| Document Upload | No | Yes ✅ |
| Add Lesson Button | Top | Bottom ✅ |
| Layout | Complex | Clean & Simple |

## ✨ What Stayed the Same

✅ Vimeo folder organization
✅ TUS protocol uploads
✅ Database integration
✅ Course deletion with cleanup
✅ All API endpoints
✅ Purple "Add Vimeo Course" button on admin page

## 🚀 Testing

1. Go to admin page: `http://localhost:3000/admin-page`
2. Click purple "Add Vimeo Course" button
3. Fill course details
4. Add lessons (with optional documents)
5. Click "Upload Vimeo Course"
6. Wait for completion
7. Check Vimeo dashboard for folder and videos
8. Check Supabase for course and lesson data

## 📦 Document Upload API

The system uses the existing `/api/upload-document` endpoint:

```typescript
POST /api/upload-document
Body: FormData with "file" field
Response: { url: "https://..." }
```

Documents are stored in your Supabase storage bucket and the URL is saved in the `document_url` column.

## ✅ Updated Files

1. [vimeo-courseuploader/page.tsx](src/app/components/vimeo-courseuploader/page.tsx) - Simplified UI
2. [create-vimeo-tables.sql](create-vimeo-tables.sql) - Added document_url field

## 🎯 Benefits of Simple Design

✅ **Easier to use** - Less overwhelming for admins
✅ **Faster** - No complex animations or drag-drop
✅ **Familiar** - Matches existing Mux uploader
✅ **Reliable** - Simpler code = fewer bugs
✅ **Mobile-friendly** - Simple forms work better on small screens

---

That's it! The Vimeo uploader is now simple, clean, and includes document upload support. 🎉
