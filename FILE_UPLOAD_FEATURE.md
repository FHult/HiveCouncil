# File Upload Feature - Complete Implementation

## Overview

HiveCouncil now supports comprehensive file upload functionality, allowing you to attach various file types to your council sessions. Files are processed and their content is included in the prompts sent to each AI provider.

## Supported File Types

### Images (with Vision Model Support)
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- **Vision Models**: GPT-4o, GPT-4o-mini, GPT-4-turbo
- Images are sent directly to vision-capable models
- Non-vision models receive image descriptions

### Documents
- **PDF** (`.pdf`) - Text extraction from all pages
- **Word** (`.docx`) - Text and tables extraction
- **Text/Markdown** (`.txt`, `.md`) - Direct content

### Code Files
- `.py`, `.js`, `.ts`, `.tsx`, `.jsx`
- `.java`, `.cpp`, `.c`, `.cs`, `.go`, `.rs`
- `.html`, `.css`, `.json`, `.xml`
- `.yaml`, `.yml`, `.sh`, `.sql`

### Spreadsheets
- **Excel** (`.xlsx`) - All sheets with data
- **CSV** (`.csv`) - Direct content

### Presentations
- **PowerPoint** (`.pptx`) - Text from all slides

## File Size Limit
- Maximum file size: **10MB** per file
- Multiple files supported per session

## Backend Implementation

### 1. File Processing Service
**File**: `backend/app/services/file_processor.py`

Handles all file types with specialized processors:
- `_process_image()`: Validates images and encodes to base64
- `_process_pdf()`: Extracts text from PDF pages
- `_process_docx()`: Extracts text and tables from Word documents
- `_process_xlsx()`: Extracts data from all Excel sheets
- `_process_pptx()`: Extracts text from PowerPoint slides

### 2. API Endpoints
**File**: `backend/app/api/routes/files.py`

**POST `/api/files/upload`**
- Upload and process a single file
- Returns `FileAttachment` with extracted content
- Supports multipart/form-data

**GET `/api/files/supported-types`**
- Returns list of supported file extensions
- Categorized by type (images, documents, code, etc.)

### 3. Session Schema Updates
**File**: `backend/app/schemas/session.py`

Added `FileAttachment` schema:
```python
class FileAttachment(BaseModel):
    filename: str
    content_type: str
    size: int
    extracted_text: str | None
    base64_data: str | None  # For images
```

Updated `SessionCreate` to accept files:
```python
files: list[FileAttachment] | None
```

### 4. Session Orchestrator
**File**: `backend/app/services/session_orchestrator.py`

Enhanced to handle file attachments:
- Processes uploaded files from session config
- Concatenates extracted text into `file_context`
- Stores first image as `image_data` for vision models
- Includes file context in all provider prompts
- Sends images to vision-capable models only

### 5. Provider Updates
**Files**: `backend/app/services/ai_providers/*.py`

All providers updated to accept `image_data` parameter:
```python
async def stream_completion(..., image_data: str | None = None)
```

**OpenAI Provider** - Full vision support:
- Sends images using multimodal message format
- Works with GPT-4o, GPT-4o-mini, GPT-4-turbo
- `supports_vision()` method returns True for vision models

Other providers accept but ignore images (can be enhanced later)

## Frontend Implementation

### 1. TypeScript Types
**File**: `frontend/src/types/index.ts`

Added `FileAttachment` interface:
```typescript
export interface FileAttachment {
  filename: string;
  content_type: string;
  size: number;
  extracted_text?: string;
  base64_data?: string;
}
```

Updated `SessionConfig` to include files:
```typescript
files?: FileAttachment[];
```

### 2. FileUpload Component
**File**: `frontend/src/components/prompt/FileUpload.tsx`

Features:
- Drag & drop file selection
- Multiple file upload
- Upload progress indicator
- File preview with extracted content
- Remove files functionality
- File size display
- Vision badge for images
- Error handling

### 3. PromptInput Integration
**File**: `frontend/src/components/prompt/PromptInput.tsx`

- Added `files` state
- Includes `<FileUpload>` component
- Passes files to session config
- Clears files after session creation

## How It Works

### Upload Flow

1. **User selects files** in FileUpload component
2. **Files are uploaded** via `/api/files/upload` endpoint
3. **Backend processes** each file:
   - Images: Validated and encoded to base64
   - Documents: Text extracted
   - Code: Content read as UTF-8
4. **FileAttachment objects** returned to frontend
5. **Files displayed** in upload component with preview
6. **Session created** with files included in config

### Session Execution Flow

1. **Session orchestrator** receives config with files
2. **File processing**:
   - Text content concatenated into `file_context`
   - First image stored as `image_data`
3. **For each provider**:
   - Prompt enhanced with file context
   - Vision models receive image data
   - Non-vision models get image description
4. **Responses generated** with full file context

## Example Usage

### Upload an Image
```typescript
// User uploads an image
// Frontend sends to /api/files/upload
// Returns:
{
  filename: "diagram.png",
  content_type: "image/png",
  size: 245678,
  extracted_text: "[Image: 1920x1080px, RGB mode, .png format]",
  base64_data: "iVBORw0KGgoAAAANS..."  // Base64 image data
}
```

### Upload a PDF
```typescript
// User uploads a PDF
// Returns:
{
  filename: "report.pdf",
  content_type: "application/pdf",
  size: 512000,
  extracted_text: "--- Page 1 ---\n<content>\n\n--- Page 2 ---\n<content>",
  base64_data: null
}
```

### Create Session with Files
```typescript
const config = {
  prompt: "Analyze this document and image",
  chair: "anthropic",
  iterations: 2,
  template: "analytical",
  preset: "balanced",
  files: [imageFile, pdfFile]
};

await startSession(config);
```

## Vision Model Behavior

### With Vision-Capable Model (e.g., GPT-4o)
- Receives both the prompt and the actual image
- Can analyze visual content directly
- Provides detailed image analysis

### Without Vision (e.g., GPT-3.5, Claude)
- Receives prompt with image description
- Gets extracted text from documents
- Cannot see visual content

## Installation Requirements

### Python Packages
```bash
pip install PyPDF2 python-docx openpyxl python-pptx Pillow python-multipart
```

All packages already added to `requirements.txt` and installed.

## Error Handling

### Backend Errors
- File too large (>10MB): 413 error
- Unsupported file type: 415 error
- Processing error: 500 error with details

### Frontend Errors
- Upload failures: Displayed in red error box
- Network errors: Caught and shown to user
- File removal: Immediate UI update

## Future Enhancements

1. **Vision Support for More Providers**
   - Anthropic Claude (supports vision)
   - Google Gemini (supports vision)

2. **Additional File Types**
   - Audio files (with transcription)
   - Video files (frame extraction)
   - Archives (.zip, .tar.gz)

3. **Advanced Features**
   - OCR for scanned PDFs
   - Image preprocessing
   - File compression
   - Cloud storage integration

## Testing

### Test File Upload
1. Start both servers
2. Open http://localhost:5173
3. Click "📎 Attach Files"
4. Select a file (image, PDF, or code)
5. File appears in upload list
6. Create session
7. Watch AI responses include file context!

### Test with Vision
1. Upload an image (PNG, JPG)
2. Set chair to "openai" (GPT-4o)
3. Prompt: "What do you see in this image?"
4. GPT-4o will analyze the actual image
5. Other models get description

## Summary

✅ **Complete file upload system**
✅ **10+ file type support**
✅ **Vision model integration**
✅ **Text extraction from documents**
✅ **Frontend upload component**
✅ **Error handling**
✅ **File size limits**
✅ **Multiple file support**

The file upload feature is fully implemented and ready to use!
