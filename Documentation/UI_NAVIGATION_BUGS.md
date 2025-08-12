# UI Navigation Bugs and Solutions

This document identifies ten navigation-related UI issues observed in the project and proposes solutions for each.

1. **Breadcrumb control lacks keyboard support**  
   `BreadcrumbNavigation.xaml.cs` exposes only a mouse-driven overflow menu without any keyboard event handling, limiting accessibility.  
   *Solution:* Add key handlers (e.g., arrow keys and ESC) and keyboard focus management to make breadcrumb traversal fully accessible.

2. **Overflow menu cannot be closed via keyboard**  
   The same control opens the context menu but does not provide a way to dismiss it via keyboard.  
   *Solution:* Handle `KeyDown` for ESC and `LostFocus` events to close the menu when keyboard users navigate away.

3. **Event handlers not detached in keyboard behavior**  
   `KeyboardNavigationBehavior.cs` attaches `KeyDown` and `PreviewKeyDown` in `AttachKeyboardNavigation` but never removes them on element unload, risking memory leaks.  
   *Solution:* Subscribe to the element's `Unloaded` event and detach handlers there.

4. **Virtualized navigation handler never removed**  
   `AttachVirtualizedNavigation` adds a `KeyDown` handler for `ItemsControl` instances but provides no counterpart to detach it when the control is removed or the feature disabled.  
   *Solution:* Track attached controls and detach the handler in `OnEnableVirtualizedNavigationChanged` when the property is set to false or the control unloads.

5. **Search results require mouse interaction**  
   `GlobalSearchBox.xaml.cs` uses `Result_MouseLeftButtonDown` for selection; there is no keyboard path to choose results.  
   *Solution:* Support arrow-key navigation and `Enter` to select results, improving accessibility.

6. **Enter key does not trigger search**  
   The `SearchTextBox_KeyDown` method handles Tab and Escape but ignores Enter, so users cannot run searches from the keyboard.  
   *Solution:* Invoke the search command when Enter is pressed.

7. **Search popup may stay open when focus changes**  
   `SearchTextBox_LostFocus` delays popup closing and lacks an explicit ESC handler, allowing the popup to remain open unintentionally.  
   *Solution:* Close the popup immediately on ESC and when focus moves outside both the box and popup.

8. **Dialogs do not restore prior focus**  
   Windows like `UserDetailWindow` close without returning focus to the element that launched them.  
   *Solution:* Cache the previously focused element before opening dialogs and restore it on close for smoother navigation.

9. **Manual view registration in main window is fragile**  
   `MainWindow_Loaded` repeatedly calls `FindName` for each view, which can break navigation when views are renamed or new ones are added.  
   *Solution:* Centralize registration using a navigation service or reflection-based discovery of views.

10. **No guard for unsaved changes during navigation**  
    The navigation system lacks state tracking; users can switch views without warning about unsaved work.  
    *Solution:* Introduce a navigation service that tracks view state and prompts users before abandoning pending changes.

