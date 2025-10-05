# Epic 3 Phases 6-7: Testing Guide

For: build-verifier-integrator
Date: October 5, 2025

## What to Test

12 discovery views with integrated PowerShell execution:
1. Active Directory
2. Azure AD  
3. Intune
4. Office 365
5. Exchange
6. SharePoint
7. Teams
8. VMware
9. SQL Server
10. File System
11. Network
12. Application

## Testing Steps

### Basic Functionality
- Click Run Discovery
- Verify progress bar appears
- Verify logs stream
- Test cancel button
- Verify completion

### Log Viewer
- Search functionality
- Filter by log level
- Export to file
- Clear logs
- Dark theme

### Performance
- Memory usage < 200MB
- 60 FPS log scrolling
- No memory leaks
- Smooth progress animation

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode
- ARIA labels

## Success Criteria

All 12 views should:
- Execute discovery (or fallback to mock)
- Stream logs in real-time
- Show progress correctly
- Support cancellation
- Work in dark theme
- Be keyboard accessible
- Have no memory leaks

## Report Issues

Critical bugs: Immediately
Performance issues: Note and track
UI issues: Screenshot and document

Status: Ready for Testing
