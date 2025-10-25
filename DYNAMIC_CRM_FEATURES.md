# Dynamic CRM Features - Complete Guide

## Overview
The admin portal now includes a powerful dynamic CRM system that allows you to create unlimited custom manager profiles and projects without any coding required.

## Features Implemented ✅

### 1. **Delete Functionality**
- **Delete Managers**: Each custom manager card has a delete button (trash icon) that appears on hover
  - Confirmation dialog before deletion
  - Cascading delete: Removes manager and all its projects
  - Success notification after deletion
  - Automatic UI update

- **Delete Projects**: Each project card within a manager has a delete button
  - Confirmation dialog before deletion
  - Success notification after deletion
  - Automatic UI update
  - Manager project count updates in real-time

### 2. **Knowledge Base Upload** (NEW!)
- **Drag & Drop Interface**: Upload documents by dragging and dropping files into the designated area
- **Click to Browse**: Alternative file selection via traditional file picker
- **Supported Formats**: PDF, TXT, DOC, DOCX
- **File Validation**: 
  - Automatic filtering of invalid file types
  - File size limit: 10MB per file
  - Error notifications for invalid files

- **File Management**:
  - Visual list of uploaded files with icons
  - File size display in human-readable format (KB, MB)
  - Individual file removal with delete button
  - File count indicator
  - Scrollable list for multiple files

- **Visual Feedback**:
  - Drag-over highlighting (blue border)
  - Upload icon animation
  - File type icons for each document
  - Real-time file list updates

### 3. **Complete Workflow**

#### Create Manager Flow:
1. Go to Admin Portal (`/`)
2. Click "Create Your First Manager" or "Create New Manager" card
3. Enter manager/service name
4. See live preview
5. Click "Create Manager"
6. Toast notification confirms creation
7. Redirected to Admin Portal with new manager visible

#### Create Project Flow:
1. Click on any manager card from Admin Portal
2. Click "Create New Project" card
3. Enter project name
4. Enter Google Sheets URL
5. **Upload knowledge base files** (drag & drop or click)
6. Remove unwanted files if needed
7. See live preview of project card
8. Click "Create Project"
9. Toast notification confirms creation
10. Redirected to Manager Detail page

#### Delete Manager Flow:
1. Hover over any custom manager card
2. Click trash icon in top-right corner
3. Confirmation dialog appears
4. Click "Delete" to confirm
5. Manager and all its projects are removed
6. Success toast notification

#### Delete Project Flow:
1. Open any manager's detail page
2. Hover over any project card
3. Click trash icon in top-right corner
4. Confirmation dialog appears
5. Click "Delete" to confirm
6. Project is removed
7. Success toast notification
8. Manager project count updates

## Data Structure

### Manager Object:
```json
{
  "id": "1234567890",
  "name": "Customer Support",
  "createdAt": "2025-10-20T...",
  "projects": [...]
}
```

### Project Object:
```json
{
  "id": "1234567890",
  "name": "Support Tickets",
  "sheetUrl": "https://docs.google.com/spreadsheets/...",
  "knowledgeBase": [
    {
      "name": "user-manual.pdf",
      "size": 2458624,
      "type": "application/pdf",
      "uploadedAt": "2025-10-20T..."
    }
  ],
  "createdAt": "2025-10-20T..."
}
```

## Technical Details

### Components Updated:
1. **AdminPortal.tsx**
   - Added delete functionality for managers
   - AlertDialog component integration
   - Dynamic manager card rendering
   - Event handling with stopPropagation

2. **ManagerDetail.tsx**
   - Added delete functionality for projects
   - AlertDialog component integration
   - Dynamic project count display
   - Real-time localStorage updates

3. **CreateProject.tsx**
   - Drag and drop file upload
   - File validation and filtering
   - Knowledge base file management
   - File size formatting utility
   - Multiple file selection support

4. **alert-dialog.tsx** (NEW)
   - Radix UI AlertDialog component
   - Custom styling with Tailwind
   - Smooth animations
   - Accessible design

### LocalStorage Keys:
- `customManagers`: Array of all manager objects with their projects

### File Upload Restrictions:
- **Accepted Types**: `.pdf`, `.txt`, `.doc`, `.docx`
- **Max File Size**: 10MB per file
- **Multiple Files**: Yes, unlimited
- **Validation**: Client-side only (for now)

## UI/UX Features

### Visual Design:
- **Gradient Cards**: Each component uses beautiful gradient backgrounds
  - Managers: Amber/Orange/Red gradient
  - Projects: Blue/Cyan/Teal gradient
  - Create Cards: Violet/Purple/Fuchsia gradient

- **Hover Effects**:
  - Scale transformation (1.02x)
  - Shadow intensity changes
  - Border color transitions
  - Delete button fade-in

- **Animations**:
  - Pulse effects on live indicators
  - Smooth transitions on all interactions
  - Loading spinners during creation
  - Drag-over highlighting

### Accessibility:
- Keyboard navigation support
- ARIA labels on interactive elements
- Focus indicators
- Screen reader friendly
- Proper semantic HTML

## Future Enhancements (Suggested)

1. **Knowledge Base Features**:
   - [ ] File preview/download
   - [ ] Search within documents
   - [ ] AI-powered document analysis
   - [ ] Document categorization

2. **Edit Functionality**:
   - [ ] Edit manager name
   - [ ] Edit project details
   - [ ] Update Google Sheets URL
   - [ ] Add/remove files from existing projects

3. **Advanced Features**:
   - [ ] Export manager data
   - [ ] Import manager configurations
   - [ ] Share managers between users
   - [ ] Role-based permissions

4. **Analytics**:
   - [ ] Manager usage statistics
   - [ ] Project activity tracking
   - [ ] File storage metrics
   - [ ] Performance dashboards

## Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Notes
- All data is stored in browser localStorage
- Files are stored as metadata only (name, size, type)
- Actual file contents are not persisted (requires backend)
- No data synchronization between devices
- Clear browser data will remove all custom managers

## Support
For issues or questions, please check the main README or contact the development team.

---
**Last Updated**: October 20, 2025
**Version**: 1.0.0
