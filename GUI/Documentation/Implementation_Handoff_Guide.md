# Implementation Handoff Guide
**Project:** M&A Discovery Suite - GUI v2 Rewrite
**Last Updated:** October 5, 2025
**Target Audience:** Next Agent/Developer Session
**Session Context:** Continuing Epic Implementation (Epics 2-5, View Integration)

## Quick Start Overview

This document provides step-by-step instructions for continuing the CLAUDE.md Epic implementation. Current status: **Epics 0-1 complete (100%), Epic 2 at 80%, Epics 3-4 architecture complete, Epic 5 at 30%**.

### What's Done
- ✅ Epic 0: UI/UX Parity (Tailwind, components)
- ✅ Epic 1: Core Data Views (Users/Computers/Groups with 9/6/6-tab detail views)
- ✅ Epic 2: Migration Planning Backend (databaseService, IPC handlers)
- ✅ Epic 3: Discovery Architecture (1,500-line architecture doc)
- ✅ Epic 4: Logic Engine Architecture (1,500-line architecture doc)
- ⏳ Epic 5: Modal system exists, dialogs need creation

### What's Next
1. **Epic 2 UI (8-12 hours)**: Drag-and-drop migration planning interface
2. **Epic 5 Completion (10-14 hours)**: Dialogs, keyboard shortcuts, command palette
3. **Epic 3 Implementation (12-16 hours)**: Discovery module execution UI
4. **Epic 4 Implementation (28-36 hours)**: Logic Engine Service (CRITICAL - unlocks real data)
5. **View Integration (75-110 hours)**: Integrate 75+ remaining views with PowerShell

---

## Priority 1: Epic 2 UI - Migration Planning Drag-and-Drop

**Status:** Backend 100% complete, UI not started
**Estimated Hours:** 8-12 hours
**Priority:** HIGH
**Files to Create:** 2 components, 1 hook, modify 4 files

### Prerequisites
Dependencies already installed:
```json
{
  "lowdb": "^7.0.1",
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1"
}
```

Backend services ready:
- `guiv2/src/main/services/databaseService.ts` (400 lines)
- `guiv2/src/main/ipcHandlers.migration.ts` (220 lines, 12 IPC handlers)

### Step-by-Step Implementation

#### Step 1: Create MigrationPlanningView Component (4-6 hours)

**File:** `guiv2/src/renderer/views/migration/MigrationPlanningView.tsx`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Migration Planning                                      │
├──────────────────┬──────────────────────────────────────┤
│  Wave List       │  Selected Wave Details               │
│  ┌────────────┐  │  ┌────────────────────────────────┐ │
│  │ Wave 1     │  │  │ Wave Name: Wave 1              │ │
│  │ Apr 15     │  │  │ Schedule: Apr 15, 2025 9:00 AM │ │
│  │ 120 items  │  │  │                                │ │
│  └────────────┘  │  │ Items (120):                   │ │
│  ┌────────────┐  │  │ ┌──────────────────────────┐   │ │
│  │ Wave 2     │  │  │ │ User: John Doe (USER)    │   │ │
│  │ Apr 22     │  │  │ │ Computer: WS001 (COMP)   │   │ │
│  │ 85 items   │  │  │ │ Group: IT-Admins (GROUP) │   │ │
│  └────────────┘  │  │ └──────────────────────────┘   │ │
│  [+ New Wave]    │  │ [Set Schedule] [Validate]      │ │
│                  │  └────────────────────────────────┘ │
└──────────────────┴──────────────────────────────────────┘
```

**Implementation:**
```typescript
// guiv2/src/renderer/views/migration/MigrationPlanningView.tsx
import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { useMigrationPlanningLogic } from '@/hooks/useMigrationPlanningLogic';
import { MigrationWave } from '@/types/migration';
import { Button } from '@/components/atoms/Button';

export const MigrationPlanningView: React.FC = () => {
  const { waves, selectedWave, selectWave, createWave, deleteWave, addItemToWave } = useMigrationPlanningLogic();
  const [newWaveName, setNewWaveName] = useState('');

  const handleCreateWave = () => {
    if (newWaveName.trim()) {
      createWave({ name: newWaveName, items: [], schedule: null });
      setNewWaveName('');
    }
  };

  return (
    <div className="flex h-full">
      {/* Left Panel: Wave List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold mb-4">Migration Waves</h2>

        {/* Wave Cards */}
        <div className="space-y-2 mb-4">
          {waves.map((wave) => (
            <WaveCard
              key={wave.id}
              wave={wave}
              isSelected={selectedWave?.id === wave.id}
              onClick={() => selectWave(wave)}
              onDelete={() => deleteWave(wave.id)}
              onDrop={(item) => addItemToWave(wave.id, item)}
            />
          ))}
        </div>

        {/* Create New Wave */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New wave name..."
            value={newWaveName}
            onChange={(e) => setNewWaveName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <Button onClick={handleCreateWave}>Create</Button>
        </div>
      </div>

      {/* Right Panel: Selected Wave Details */}
      <div className="flex-1 p-4">
        {selectedWave ? (
          <WaveDetailsPanel wave={selectedWave} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a wave to view details
          </div>
        )}
      </div>
    </div>
  );
};
```

**WaveCard Component with Drop Target:**
```typescript
interface WaveCardProps {
  wave: MigrationWave;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDrop: (item: { id: string; type: string; name: string }) => void;
}

const WaveCard: React.FC<WaveCardProps> = ({ wave, isSelected, onClick, onDelete, onDrop }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['USER', 'COMPUTER', 'GROUP'],
    drop: (item: { id: string; type: string; name: string }) => {
      onDrop(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      onClick={onClick}
      className={`
        p-4 rounded-lg border-2 cursor-pointer transition-colors
        ${isSelected ? 'border-accent bg-accent/10' : 'border-gray-200 dark:border-gray-700'}
        ${isOver ? 'bg-accent/20 border-accent' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{wave.name}</h3>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {wave.schedule?.scheduledDate
          ? new Date(wave.schedule.scheduledDate).toLocaleDateString()
          : 'Not scheduled'}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {wave.items.length} items
      </p>
    </div>
  );
};
```

**WaveDetailsPanel Component:**
```typescript
const WaveDetailsPanel: React.FC<{ wave: MigrationWave }> = ({ wave }) => {
  const { updateSchedule, removeItem, validateWave } = useMigrationPlanningLogic();
  const [validationResult, setValidationResult] = useState(null);

  const handleValidate = async () => {
    const result = await window.electron.invoke('migration:validate-wave', { waveId: wave.id });
    setValidationResult(result);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{wave.name}</h2>

      {/* Schedule Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Schedule</h3>
        <div className="flex gap-2">
          <input
            type="datetime-local"
            value={wave.schedule?.scheduledDate || ''}
            onChange={(e) => updateSchedule(wave.id, { scheduledDate: e.target.value })}
            className="px-3 py-2 border rounded"
          />
          <Button onClick={handleValidate}>Validate</Button>
        </div>
        {validationResult && (
          <div className={`mt-2 p-2 rounded ${validationResult.isValid ? 'bg-green-100' : 'bg-red-100'}`}>
            {validationResult.isValid ? 'Wave is valid' : validationResult.errors.join(', ')}
          </div>
        )}
      </div>

      {/* Items Section */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Items ({wave.items.length})</h3>
        <div className="space-y-1">
          {wave.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <span>{item.type}: {item.name}</span>
              <button onClick={() => removeItem(wave.id, item.id)}>
                <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
```

#### Step 2: Create useMigrationPlanningLogic Hook (2-3 hours)

**File:** `guiv2/src/renderer/hooks/useMigrationPlanningLogic.ts`

```typescript
import { useState, useEffect } from 'react';
import { useProfileStore } from '@/store/useProfileStore';
import { MigrationWave, MigrationItem, WaveSchedule } from '@/types/migration';

export const useMigrationPlanningLogic = () => {
  const [waves, setWaves] = useState<MigrationWave[]>([]);
  const [selectedWave, setSelectedWave] = useState<MigrationWave | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedProfile } = useProfileStore();

  // Load waves when profile changes
  useEffect(() => {
    if (!selectedProfile) return;

    const loadWaves = async () => {
      setIsLoading(true);
      try {
        const result = await window.electron.invoke('migration:get-waves');
        setWaves(result);
      } catch (error) {
        console.error('Failed to load waves:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadWaves();
  }, [selectedProfile]);

  const createWave = async (wave: Omit<MigrationWave, 'id'>) => {
    try {
      const newWave = await window.electron.invoke('migration:add-wave', { wave });
      setWaves([...waves, newWave]);
    } catch (error) {
      console.error('Failed to create wave:', error);
    }
  };

  const deleteWave = async (waveId: string) => {
    try {
      await window.electron.invoke('migration:delete-wave', { waveId });
      setWaves(waves.filter((w) => w.id !== waveId));
      if (selectedWave?.id === waveId) setSelectedWave(null);
    } catch (error) {
      console.error('Failed to delete wave:', error);
    }
  };

  const selectWave = (wave: MigrationWave) => {
    setSelectedWave(wave);
  };

  const addItemToWave = async (waveId: string, item: { id: string; type: string; name: string }) => {
    try {
      const migrationItem: MigrationItem = {
        id: item.id,
        type: item.type as 'USER' | 'COMPUTER' | 'GROUP',
        name: item.name,
        status: 'Pending',
      };
      await window.electron.invoke('migration:add-item-to-wave', { waveId, item: migrationItem });

      // Reload waves
      const updated = await window.electron.invoke('migration:get-waves');
      setWaves(updated);

      // Update selected wave if it's the one we added to
      if (selectedWave?.id === waveId) {
        setSelectedWave(updated.find((w: MigrationWave) => w.id === waveId));
      }
    } catch (error) {
      console.error('Failed to add item to wave:', error);
    }
  };

  const removeItem = async (waveId: string, itemId: string) => {
    try {
      await window.electron.invoke('migration:remove-item', { waveId, itemId });

      // Reload waves
      const updated = await window.electron.invoke('migration:get-waves');
      setWaves(updated);

      if (selectedWave?.id === waveId) {
        setSelectedWave(updated.find((w: MigrationWave) => w.id === waveId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const updateSchedule = async (waveId: string, schedule: WaveSchedule) => {
    try {
      await window.electron.invoke('migration:update-schedule', { waveId, schedule });

      // Update local state
      const updated = waves.map((w) =>
        w.id === waveId ? { ...w, schedule } : w
      );
      setWaves(updated);

      if (selectedWave?.id === waveId) {
        setSelectedWave({ ...selectedWave, schedule });
      }
    } catch (error) {
      console.error('Failed to update schedule:', error);
    }
  };

  const validateWave = async (waveId: string) => {
    try {
      return await window.electron.invoke('migration:validate-wave', { waveId });
    } catch (error) {
      console.error('Failed to validate wave:', error);
      return { isValid: false, errors: ['Validation failed'] };
    }
  };

  return {
    waves,
    selectedWave,
    isLoading,
    createWave,
    deleteWave,
    selectWave,
    addItemToWave,
    removeItem,
    updateSchedule,
    validateWave,
  };
};
```

#### Step 3: Add Drag Sources to List Views (2-3 hours)

**Modify:** `guiv2/src/renderer/views/UsersView.tsx`

```typescript
import { useDrag } from 'react-dnd';

// Inside the row rendering logic:
const UserRow: React.FC<{ user: UserData }> = ({ user }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'USER',
    item: { id: user.sid, type: 'USER', name: user.displayName },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <tr ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {/* existing row content */}
    </tr>
  );
};
```

**Repeat for:**
- `guiv2/src/renderer/views/ComputersView.tsx` (type: 'COMPUTER', id: computer.name)
- `guiv2/src/renderer/views/GroupsView.tsx` (type: 'GROUP', id: group.sid)

#### Step 4: Wire Up DnD Provider (0.5 hours)

**Modify:** `guiv2/src/renderer/App.tsx`

```typescript
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Router>
        {/* existing routes */}
        <Route path="/migration/planning" element={<MigrationPlanningView />} />
      </Router>
    </DndProvider>
  );
};
```

#### Step 5: Testing Checklist (1-2 hours)

- [ ] Create new wave
- [ ] Delete wave
- [ ] Drag user from UsersView to wave card (should add to wave)
- [ ] Drag computer from ComputersView to wave card
- [ ] Drag group from GroupsView to wave card
- [ ] Remove item from wave
- [ ] Set schedule for wave
- [ ] Validate wave (check for dependency conflicts)
- [ ] Switch profiles (waves should persist per profile)
- [ ] Check backup files created in `C:\discoverydata\{Profile}\migration-plan.backup.*.json`

---

## Priority 2: Epic 5 Completion - Dialogs & Shortcuts

**Status:** Modal system exists (30% complete), dialogs need creation (70% remaining)
**Estimated Hours:** 10-14 hours
**Priority:** MEDIUM

### Step 1: Verify Modal System (1 hour)

**Check:** `guiv2/src/renderer/store/useModalStore.ts`

Expected implementation:
```typescript
interface ModalState {
  isOpen: boolean;
  Component: React.ElementType | null;
  props: Record<string, any>;
  openModal: (Component: React.ElementType, props?: Record<string, any>) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  Component: null,
  props: {},
  openModal: (Component, props = {}) => set({ isOpen: true, Component, props }),
  closeModal: () => set({ isOpen: false, Component: null, props: {} }),
}));
```

**Check:** Modal container in `App.tsx`:
```typescript
const { isOpen, Component, props, closeModal } = useModalStore();

return (
  <>
    {/* main app content */}
    {isOpen && Component && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Component {...props} onClose={closeModal} />
      </div>
    )}
  </>
);
```

**If missing:** Create modal system first before proceeding to dialogs.

### Step 2: Create WaveSchedulingDialog (2-3 hours)

**Install dependency:**
```bash
npm install react-datepicker @types/react-datepicker
```

**File:** `guiv2/src/renderer/components/dialogs/WaveSchedulingDialog.tsx`

```typescript
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button } from '@/components/atoms/Button';

interface WaveSchedulingDialogProps {
  waveId: string;
  currentSchedule?: { scheduledDate: string };
  onClose: () => void;
  onSave: (schedule: { scheduledDate: string; timezone: string }) => void;
}

export const WaveSchedulingDialog: React.FC<WaveSchedulingDialogProps> = ({
  waveId,
  currentSchedule,
  onClose,
  onSave,
}) => {
  const [selectedDate, setSelectedDate] = useState(
    currentSchedule?.scheduledDate ? new Date(currentSchedule.scheduledDate) : new Date()
  );
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const handleSave = () => {
    onSave({
      scheduledDate: selectedDate.toISOString(),
      timezone,
    });
    onClose();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
      <h2 className="text-xl font-semibold mb-4">Schedule Migration Wave</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Date & Time</label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date || new Date())}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          dateFormat="MMMM d, yyyy h:mm aa"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Timezone</label>
        <select
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Schedule</Button>
      </div>
    </div>
  );
};
```

**Usage example in MigrationPlanningView:**
```typescript
import { useModalStore } from '@/store/useModalStore';
import { WaveSchedulingDialog } from '@/components/dialogs/WaveSchedulingDialog';

const { openModal } = useModalStore();

const handleSetSchedule = () => {
  openModal(WaveSchedulingDialog, {
    waveId: selectedWave.id,
    currentSchedule: selectedWave.schedule,
    onSave: (schedule) => updateSchedule(selectedWave.id, schedule),
  });
};
```

### Step 3: Create Remaining Dialogs (4-5 hours)

Follow the same pattern for:
1. **BulkEditDialog** (2 hours)
2. **DependencyWarningDialog** (1 hour)
3. **ExportOptionsDialog** (1-2 hours)

Reference WaveSchedulingDialog structure for consistency.

### Step 4: Keyboard Shortcuts (3-4 hours)

**File:** `guiv2/src/renderer/hooks/useKeyboardShortcuts.ts`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTabStore } from '@/store/useTabStore';
import { useModalStore } from '@/store/useModalStore';
import { CommandPalette } from '@/components/organisms/CommandPalette';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { closeTab, openTab } = useTabStore();
  const { openModal, closeModal, isOpen } = useModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      // Ctrl+N: New Profile
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        // TODO: Open CreateProfileDialog
      }

      // Ctrl+T: New Tab
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        navigate('/');
      }

      // Ctrl+W: Close Tab
      if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        // TODO: Close current tab
      }

      // Ctrl+F: Focus Search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }

      // Ctrl+E: Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        // TODO: Open ExportOptionsDialog
      }

      // Ctrl+/: Open Command Palette
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        openModal(CommandPalette, {});
      }

      // Esc: Close Modal/Dialog
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, openModal, closeModal, isOpen]);
};
```

**Integrate in App.tsx:**
```typescript
export const App: React.FC = () => {
  useKeyboardShortcuts();

  return (
    <DndProvider backend={HTML5Backend}>
      {/* app content */}
    </DndProvider>
  );
};
```

### Step 5: Command Palette (4-6 hours)

**Install dependency:**
```bash
npm install fuse.js
```

**File:** `guiv2/src/renderer/lib/commandRegistry.ts`

```typescript
export interface Command {
  id: string;
  name: string;
  description: string;
  category: string;
  action: () => void;
  shortcut?: string;
}

export const createCommandRegistry = (navigate: (path: string) => void) => {
  const commands: Command[] = [
    // Navigation
    {
      id: 'open-users',
      name: 'Open Users View',
      description: 'View all discovered users',
      category: 'Navigation',
      action: () => navigate('/users'),
      shortcut: 'Ctrl+1',
    },
    {
      id: 'open-computers',
      name: 'Open Computers View',
      description: 'View all discovered computers',
      category: 'Navigation',
      action: () => navigate('/computers'),
      shortcut: 'Ctrl+2',
    },
    {
      id: 'open-groups',
      name: 'Open Groups View',
      description: 'View all discovered groups',
      category: 'Navigation',
      action: () => navigate('/groups'),
      shortcut: 'Ctrl+3',
    },
    {
      id: 'open-migration-planning',
      name: 'Open Migration Planning',
      description: 'Manage migration waves',
      category: 'Migration',
      action: () => navigate('/migration/planning'),
    },
    // Discovery
    {
      id: 'run-discovery',
      name: 'Run Discovery Module',
      description: 'Execute a discovery module',
      category: 'Discovery',
      action: () => navigate('/discovery'),
    },
    // Export
    {
      id: 'export-users',
      name: 'Export Users',
      description: 'Export user data to CSV',
      category: 'Export',
      action: () => {
        // TODO: Trigger export
      },
      shortcut: 'Ctrl+E',
    },
    // Settings
    {
      id: 'open-settings',
      name: 'Open Settings',
      description: 'Configure application settings',
      category: 'Settings',
      action: () => navigate('/settings'),
    },
  ];

  return commands;
};
```

**File:** `guiv2/src/renderer/components/organisms/CommandPalette.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Fuse from 'fuse.js';
import { createCommandRegistry, Command } from '@/lib/commandRegistry';

interface CommandPaletteProps {
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = createCommandRegistry(navigate);
  const fuse = new Fuse(commands, {
    keys: ['name', 'description', 'category'],
    threshold: 0.3,
  });

  const results = query
    ? fuse.search(query).map((result) => result.item)
    : commands;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      results[selectedIndex]?.action();
      onClose();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg w-[600px] max-h-[500px] overflow-hidden">
      <input
        type="text"
        placeholder="Type a command or search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-full px-4 py-3 text-lg border-b dark:border-gray-700"
      />
      <div className="overflow-y-auto max-h-[400px]">
        {results.map((command, index) => (
          <div
            key={command.id}
            onClick={() => {
              command.action();
              onClose();
            }}
            className={`
              px-4 py-3 cursor-pointer
              ${index === selectedIndex ? 'bg-accent/20' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
            `}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{command.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{command.description}</div>
              </div>
              {command.shortcut && (
                <div className="text-sm text-gray-500 dark:text-gray-400">{command.shortcut}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## Priority 3: Epic 3 Implementation - Discovery Module Execution

**Status:** Architecture complete, implementation not started
**Estimated Hours:** 12-16 hours
**Architecture Reference:** `Epic3_Discovery_Module_Execution_Architecture.md`

### Prerequisites
- PowerShell service already exists: `guiv2/src/main/services/powerShellService.ts`
- IPC streaming already functional

### Implementation Steps

**Step 1: Create ModuleRegistry.json** (2-3 hours)

**File:** `guiv2/src/main/config/ModuleRegistry.json`

Catalog all 30+ discovery modules. Example structure:
```json
{
  "version": "1.0",
  "modules": [
    {
      "id": "domain-discovery",
      "name": "Domain Discovery",
      "description": "Discover Active Directory domains, domain controllers, and forest structure",
      "category": "Infrastructure",
      "icon": "network",
      "scriptPath": "Modules/Discovery/Get-DomainInfo.psm1",
      "parameters": [
        { "name": "Domain", "type": "string", "required": false, "description": "Target domain (defaults to current)" },
        { "name": "IncludeChildDomains", "type": "boolean", "required": false, "default": true }
      ],
      "estimatedDuration": "2-5 minutes",
      "outputFormat": "CSV"
    },
    {
      "id": "user-discovery",
      "name": "User Discovery",
      "description": "Discover all Active Directory user accounts",
      "category": "Identity",
      "icon": "users",
      "scriptPath": "Modules/Discovery/Get-AllUsers.psm1",
      "parameters": [
        { "name": "IncludeDisabled", "type": "boolean", "required": false, "default": false }
      ],
      "estimatedDuration": "5-15 minutes",
      "outputFormat": "CSV"
    }
    // ... add all 30+ modules
  ]
}
```

**Step 2: Create DiscoveryView** (4-6 hours)

**File:** `guiv2/src/renderer/views/discovery/DiscoveryView.tsx`

Refer to Epic3 architecture document for complete implementation details.

**Step 3: Create DiscoveryExecutionPanel** (3-4 hours)

Real-time log viewer with auto-scroll, progress bar, elapsed time.

**Step 4: Create useDiscoveryLogic Hook** (2-3 hours)

Orchestrate execution, listen for IPC events, update state.

**Step 5: Testing** (1-2 hours)

Test with real PowerShell modules, cancellation, error handling.

---

## Priority 4: Epic 4 Implementation - Logic Engine Service

**Status:** Architecture complete, implementation not started
**Estimated Hours:** 28-36 hours
**Priority:** CRITICAL (unlocks real data for all views)
**Architecture Reference:** `Epic4_Logic_Engine_Architecture.md`

### Why This Is Critical
- All detail views currently use mock data
- Once Epic 4 is complete, all views will show real correlated data
- Unlocks 75+ view integrations
- Core value proposition of the application

### Implementation Plan

Follow the Epic4 architecture document step-by-step. The document provides:
- Complete service structure
- 30+ data indices design
- 9 inference rules with algorithms
- Levenshtein fuzzy matching implementation
- Projection builder patterns
- Caching strategy
- Performance benchmarks

**Estimated Breakdown:**
- Core service structure: 4-6 hours
- CSV loaders + indices: 6-8 hours
- Inference rules (9 × 2 hours): 18-20 hours
- Projection builders: 4-6 hours
- Caching layer: 3-4 hours
- Testing: 4-6 hours

**Key Files to Create:**
- `guiv2/src/main/services/logicEngineService.ts` (1,500+ lines)

**Key Files to Modify:**
- `guiv2/src/main/ipcHandlers.ts` (replace mock data with real projections)
- `guiv2/src/main/main.ts` (initialize logic engine on startup)

---

## Priority 5: View Integration (After Epic 4)

**Status:** 0/75+ views integrated
**Estimated Hours:** 75-110 hours
**Dependency:** Epic 4 must be complete

### Integration Pattern

For each view:
1. Read C# reference in `/GUI/Views/{ViewName}.xaml.cs`
2. Identify PowerShell module to call
3. Create view component: `guiv2/src/renderer/views/{category}/{ViewName}.tsx`
4. Create logic hook: `guiv2/src/renderer/hooks/use{ViewName}Logic.ts`
5. Define types: `guiv2/src/renderer/types/{viewName}.ts`
6. Call PowerShell via IPC
7. Display data (usually in DataTable or custom layout)
8. Add routing in `App.tsx`
9. Test with real data

### Priority Order
1. **Analytics Views (8 views)**: 8-12 hours - High business value
2. **Infrastructure Views (15 views)**: 15-20 hours - Asset tracking
3. **Security/Compliance Views (12 views)**: 12-18 hours - Compliance critical
4. **Administration Views (10 views)**: 10-15 hours - User management
5. **Advanced Views (30+ views)**: 30-45 hours - Specialized features

---

## Build Verification

### Before Starting Work
```bash
cd D:\Scripts\UserMandA\guiv2
npm install  # Ensure all dependencies installed
npm run lint  # Check TypeScript errors
npm run start  # Verify app launches
```

### After Completing Each Epic
- [ ] No TypeScript errors
- [ ] Application launches without errors
- [ ] New functionality works as expected
- [ ] No console errors
- [ ] Dark/light theme still works
- [ ] Existing features not broken

### E2E Testing Flow
1. **Epic 2**: Create wave → Drag user to wave → Set schedule → Validate
2. **Epic 5**: Open command palette (Ctrl+/) → Navigate → Close with Esc
3. **Epic 3**: Select discovery module → Run → Monitor logs → Cancel/Complete
4. **Epic 4**: View user detail → Check all 9 tabs → Verify real data (not mocks)

---

## Common Pitfalls & Solutions

### Pitfall 1: Drag-and-Drop Not Working
**Solution:** Ensure `DndProvider` wraps the entire app in `App.tsx`, not just the migration view.

### Pitfall 2: IPC Handlers Not Found
**Solution:** Verify handler registration in `main.ts`:
```typescript
import { registerMigrationHandlers } from './ipcHandlers.migration';

app.whenReady().then(() => {
  registerMigrationHandlers();
});
```

### Pitfall 3: Modal Not Closing
**Solution:** Pass `onClose` prop to all dialog components and call it on cancel/save.

### Pitfall 4: TypeScript Errors with `any`
**Solution:** Replace `any` with proper types from `types/` directory.

### Pitfall 5: Logic Engine Performance Issues
**Solution:** Follow architecture document's caching strategy. Use indices for O(1) lookups, not array iteration.

---

## Success Criteria

### Epic 2 Complete
- [ ] Can create/delete waves
- [ ] Can drag users/computers/groups to waves
- [ ] Can set schedule for waves
- [ ] Can validate waves
- [ ] Waves persist across profile changes
- [ ] Backups created automatically

### Epic 5 Complete
- [ ] All dialogs functional
- [ ] Keyboard shortcuts work
- [ ] Command palette opens with Ctrl+/
- [ ] Modal system robust

### Epic 3 Complete
- [ ] Can execute discovery modules
- [ ] Real-time log streaming works
- [ ] Progress tracking accurate
- [ ] Can cancel running modules
- [ ] Results viewable after completion

### Epic 4 Complete
- [ ] All CSV files loaded successfully
- [ ] User detail projection shows real data (all 9 tabs)
- [ ] Computer detail projection shows real data (all 6 tabs)
- [ ] Group detail projection shows real data (all 6 tabs)
- [ ] Inference rules produce accurate correlations
- [ ] Performance benchmarks met (<5s load, <100ms cached)

---

## Getting Help

### Architecture Documents
- **Epic 3**: `D:\Scripts\UserMandA\GUI\Documentation\Epic3_Discovery_Module_Execution_Architecture.md`
- **Epic 4**: `D:\Scripts\UserMandA\GUI\Documentation\Epic4_Logic_Engine_Architecture.md`

### Reference Implementations
- **Detail Views**: `guiv2/src/renderer/views/users/UserDetailView.tsx`
- **DataTable**: `guiv2/src/renderer/components/organisms/DataTable.tsx`
- **IPC Handlers**: `guiv2/src/main/ipcHandlers.ts`
- **Migration Backend**: `guiv2/src/main/services/databaseService.ts`

### CLAUDE.md
- **Epic Specifications**: `D:\Scripts\UserMandA\CLAUDE.md`
- **Working Patterns**: Reference Users/Computers/Groups views

---

## Next Session Checklist

**Before Starting:**
- [ ] Read this handoff guide completely
- [ ] Review Epic Completion Checklist
- [ ] Check current git status
- [ ] Verify build works: `npm run start`

**Priority 1 (8-12 hours):**
- [ ] Epic 2 UI: Implement drag-and-drop migration planning

**Priority 2 (10-14 hours):**
- [ ] Epic 5: Create dialogs, keyboard shortcuts, command palette

**Priority 3 (12-16 hours):**
- [ ] Epic 3: Implement discovery module execution

**Priority 4 (28-36 hours):**
- [ ] Epic 4: Implement Logic Engine Service (CRITICAL)

**After Epic 4:**
- [ ] Begin view integration (75-110 hours)

---

**Document Version:** 1.0
**Last Updated:** October 5, 2025
**Next Update:** After Epic 2 UI completion
