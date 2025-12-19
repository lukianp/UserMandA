# UI/UX Enhancement Implementation Guide for guiv2

> **For: Claude Code / AI Implementation**
> **Project:** Enterprise Discovery Suite - guiv2 (React/Electron/TypeScript)
> **Priority:** Visual Polish & Micro-interactions
> **Estimated Scope:** 15-20 file modifications

---

## 🎯 OBJECTIVE

Activate underutilized design tokens from `tailwind.config.js` and implement consistent micro-interactions across the component library to achieve a polished, professional enterprise UI.

---

## ✅ IMPLEMENTATION STATUS: 100% COMPLETE

All phases have been implemented:
- **Phase 1:** Quick Wins ✅
- **Phase 2:** Component Polish ✅
- **Phase 3:** Layout Enhancements ✅
- **Phase 4:** Global Styles ✅

> **Note:** DataTable.tsx enhancement was skipped (N/A) - project uses AG Grid's VirtualizedDataGrid instead.

---

## COMPLETED FEATURES

| Component | Enhancement |
|-----------|-------------|
| StatisticsCard | `group` class for hover indicator |
| ModernCard | shadow-card, shadow-metric tokens, hover effects |
| StatusIndicator | `animate-pulse-glow` for success/online states |
| Button | `gradient` and `gradient-success` variants + ripple effect |
| ProgressBar | `indeterminate` mode and shimmer animations |
| Skeleton.tsx | SkeletonCard and SkeletonTable presets |
| Sidebar | Collapse/expand toggle (isCollapsed state) |
| Nav items | Gradient backgrounds for active state |
| index.css | hover-lift, focus-ring-glow, active-scale, glass-effect utilities |
| Animations | pulse-glow, shimmer, ripple, slide-in-right, slide-in-up, progress-indeterminate |

---

## 📁 FILES TO MODIFY

```
guiv2/src/renderer/
├── components/
│   ├── atoms/
│   │   ├── Button.tsx           # Add gradient variants, ripple effect
│   │   ├── ModernCard.tsx       # Apply shadow-card, hover effects
│   │   ├── StatusIndicator.tsx  # Add pulse-glow animation
│   │   ├── Spinner.tsx          # Optional: enhance animation
│   │   └── Skeleton.tsx         # NEW FILE: Create skeleton loader
│   ├── molecules/
│   │   ├── StatisticsCard.tsx   # Fix hover indicator bug
│   │   ├── ProgressBar.tsx      # Add gradient animation
│   │   └── ProfileSelector.tsx  # Minor hover improvements
│   ├── organisms/
│   │   ├── Sidebar.tsx          # Add collapse, gradients
│   │   ├── DataTable.tsx        # Improve row hover states
│   │   └── TabView.tsx          # Add active tab indicator
│   └── layouts/
│       └── MainLayout.tsx       # Support collapsed sidebar state
├── styles/
│   └── index.css                # Add new utilities, keyframes
└── tailwind.config.js           # Already has tokens (reference only)
```

---

## 🔧 DETAILED IMPLEMENTATION SPECS

### 1.1 Fix StatisticsCard Hover Indicator

**File:** `guiv2/src/renderer/components/molecules/StatisticsCard.tsx`

**Problem:** Line ~90 has `group-hover:opacity-100` but parent lacks `group` class.

**Solution:**
```tsx
// BEFORE (around line 47-53):
<ModernCard
  className={clsx(
    'transition-all duration-200',
    onClick && 'cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg',
    className
  )}

// AFTER:
<ModernCard
  className={clsx(
    'group transition-all duration-200',  // ADD 'group' class
    onClick && 'cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-card-hover',  // Use design token
    className
  )}
```

Also update the hover indicator div:
```tsx
// Around line 85-88, change:
{onClick && (
  <div className="mt-3 text-xs text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-200">
    Click to view details →
  </div>
)}
```

---

### 1.2 Apply Neon Shadows to ModernCard

**File:** `guiv2/src/renderer/components/atoms/ModernCard.tsx`

**Add shadow tokens from tailwind.config.js:**

```tsx
// Update variantClasses (around line 55-70):
const variantClasses = {
  default: clsx(
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'rounded-card p-5',
    'shadow-card',  // ADD: Use design token
    'transition-all duration-200',
    hoverable && 'hover:shadow-card-hover hover:scale-[1.01] hover:-translate-y-0.5'  // ADD hover effects
  ),
  metric: clsx(
    'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
    'border border-gray-200 dark:border-gray-700',
    'rounded-card p-4',
    'shadow-metric',  // ADD
    'transition-all duration-200',
    hoverable && 'hover:shadow-metric-hover'
  ),
  section: clsx(
    'bg-white dark:bg-gray-800',
    'border border-gray-200 dark:border-gray-700',
    'rounded-section p-6',
    'shadow-section'  // ADD
  ),
  glass: clsx(
    'backdrop-blur-md bg-white/70 dark:bg-gray-900/70',
    'border border-white/20 dark:border-gray-700/50',
    'rounded-card p-5',
    'shadow-card',
    hoverable && 'hover:shadow-card-hover hover:scale-[1.01]'
  ),
};
```

---

### 1.3 Add Pulse-Glow to StatusIndicator

**File:** `guiv2/src/renderer/components/atoms/StatusIndicator.tsx`

**Enhance the dot animation for online/success states:**

```tsx
// Around line 85-100, update the dot classes:
const dotClasses = clsx(
  'rounded-full',
  statusColorClasses[status],
  dotSizeClasses[size],
  {
    'animate-pulse': animate && !['online', 'success'].includes(status),
    'animate-pulse-glow': animate && ['online', 'success'].includes(status),  // Use neon glow for positive states
  }
);

// Add glow ring effect for online status (around line 105):
{(animate && ['online', 'success'].includes(status)) && (
  <span
    className={clsx(
      'absolute inline-flex h-full w-full rounded-full opacity-50',
      status === 'online' ? 'bg-status-online' : 'bg-success',
      'animate-ping'
    )}
    style={{ animationDuration: '1.5s' }}
    aria-hidden="true"
  />
)}
```

---

### 1.4 Add Hover Lift to Clickable Cards

**File:** `guiv2/src/renderer/index.css`

**Add utility class:**
```css
@layer utilities {
  /* Existing utilities... */

  /* Hover lift effect for interactive cards */
  .hover-lift {
    @apply transition-all duration-200 ease-out;
  }
  .hover-lift:hover {
    @apply -translate-y-1 shadow-lg;
  }

  /* Card glow effect */
  .card-glow {
    @apply relative;
  }
  .card-glow::before {
    content: '';
    @apply absolute inset-0 rounded-card opacity-0 transition-opacity duration-300;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 128, 255, 0.1) 100%);
    z-index: -1;
  }
  .card-glow:hover::before {
    @apply opacity-100;
  }
}
```

---

### 2.1 Enhance Button with Gradient Variants

**File:** `guiv2/src/renderer/components/atoms/Button.tsx`

**Add new gradient variants:**

```tsx
// Add to ButtonProps interface (around line 15):
variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'gradient' | 'gradient-success';

// Add to variants object (around line 55):
gradient: clsx(
  'bg-gradient-to-r from-blue-600 to-cyan-500 text-white',
  'hover:from-blue-700 hover:to-cyan-600',
  'focus:ring-blue-500',
  'shadow-button hover:shadow-neon-cyan',
  'disabled:from-blue-300 disabled:to-cyan-300 disabled:cursor-not-allowed'
),
'gradient-success': clsx(
  'bg-gradient-to-r from-green-500 to-emerald-400 text-white',
  'hover:from-green-600 hover:to-emerald-500',
  'focus:ring-green-500',
  'shadow-button',
  'disabled:from-green-300 disabled:to-emerald-300 disabled:cursor-not-allowed'
),
```

**Add ripple effect (optional but recommended):**
```tsx
// Add state for ripple
const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

// Add ripple handler
const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const id = Date.now();
  
  setRipples(prev => [...prev, { x, y, id }]);
  setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
};

// Render ripples inside button
{ripples.map(ripple => (
  <span
    key={ripple.id}
    className="absolute rounded-full bg-white/30 animate-ripple pointer-events-none"
    style={{
      left: ripple.x - 10,
      top: ripple.y - 10,
      width: 20,
      height: 20,
    }}
  />
))}
```

**Add ripple animation to index.css:**
```css
@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}
.animate-ripple {
  animation: ripple 0.6s linear;
}
```

---

### 2.2 Improve ProgressBar with Animated Gradient

**File:** `guiv2/src/renderer/components/molecules/ProgressBar.tsx`

```tsx
// Update the bar classes (around line 75):
const barClasses = clsx(
  'h-full transition-all duration-500 ease-out',  // Smoother transition
  variantClasses[variant],
  {
    'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%] animate-shimmer': striped,
    'animate-progress-stripes': striped && animated,
  }
);

// Add indeterminate variant support
{indeterminate && (
  <div 
    className={clsx(
      'h-full rounded-full',
      variantClasses[variant],
      'animate-progress-indeterminate'
    )}
    style={{ width: '30%' }}
  />
)}
```

**Add to index.css:**
```css
@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}
.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
.animate-shimmer {
  animation: shimmer 2s linear infinite;
}
```

---

### 2.3 Create Skeleton Loader Component

**File:** `guiv2/src/renderer/components/atoms/Skeleton.tsx` (NEW FILE)

```tsx
/**
 * Skeleton Component
 * 
 * Placeholder loading state with shimmer animation.
 * Use instead of spinners for better perceived performance.
 */

import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps {
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  /** Width (CSS value or Tailwind class) */
  width?: string;
  /** Height (CSS value or Tailwind class) */
  height?: string;
  /** Number of lines for text variant */
  lines?: number;
  /** Additional classes */
  className?: string;
  /** Cypress test selector */
  'data-cy'?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className,
  'data-cy': dataCy,
}) => {
  const baseClasses = clsx(
    'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700',
    'bg-[length:200%_100%] animate-shimmer'
  );

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'rounded-card',
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)} data-cy={dataCy}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(baseClasses, variantClasses.text)}
            style={{
              width: i === lines - 1 ? '75%' : width || '100%',
              height: height || undefined,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      style={{
        width: width || (variant === 'circular' ? '40px' : '100%'),
        height: height || (variant === 'circular' ? '40px' : variant === 'card' ? '200px' : '20px'),
      }}
      data-cy={dataCy}
    />
  );
};

// Pre-composed skeleton patterns
export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx('p-4 space-y-4', className)}>
    <Skeleton variant="rectangular" height="120px" />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; className?: string }> = ({ 
  rows = 5, 
  className 
}) => (
  <div className={clsx('space-y-3', className)}>
    <div className="flex gap-4">
      <Skeleton width="20%" />
      <Skeleton width="30%" />
      <Skeleton width="25%" />
      <Skeleton width="25%" />
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton width="20%" />
        <Skeleton width="30%" />
        <Skeleton width="25%" />
        <Skeleton width="25%" />
      </div>
    ))}
  </div>
);

export default Skeleton;
```

---

### 3.1 Add Collapsible Sidebar

**File:** `guiv2/src/renderer/components/organisms/Sidebar.tsx`

**Add collapse state and toggle:**

```tsx
// Add to imports
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Add state (around line 65)
const [isCollapsed, setIsCollapsed] = useState(false);

// Update aside element (around line 185):
<aside 
  className={clsx(
    'bg-gray-900 text-white flex flex-col relative z-50 transition-all duration-300 ease-in-out',
    isCollapsed ? 'w-16' : 'w-64'
  )}
>

// Add collapse toggle button after logo section:
<button
  onClick={() => setIsCollapsed(!isCollapsed)}
  className={clsx(
    'absolute -right-3 top-20 z-50',
    'w-6 h-6 rounded-full',
    'bg-gray-800 border border-gray-700',
    'flex items-center justify-center',
    'text-gray-400 hover:text-white hover:bg-gray-700',
    'transition-all duration-200',
    'shadow-lg'
  )}
  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
>
  {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
</button>

// Update logo section visibility:
<div className={clsx('p-4 border-b border-gray-800', isCollapsed && 'px-2')}>
  {!isCollapsed ? (
    <>
      <h1 className="text-xl font-bold">Enterprise Discovery</h1>
      <p className="text-xs text-gray-400 mt-1">M&A Platform</p>
    </>
  ) : (
    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center mx-auto">
      <span className="text-white font-bold text-sm">ED</span>
    </div>
  )}
</div>

// Update nav items to show only icons when collapsed:
<NavLink
  to={item.path}
  className={({ isActive }) =>
    clsx(
      'flex items-center gap-3 px-4 py-2 text-sm transition-colors',
      'hover:bg-gray-800 hover:text-white',
      isActive
        ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white border-l-4 border-blue-500'  // GRADIENT active state
        : 'text-gray-300',
      isCollapsed && 'justify-center px-2'
    )
  }
  title={isCollapsed ? item.label : undefined}
>
  {item.icon}
  {!isCollapsed && <span>{item.label}</span>}
</NavLink>
```

**Update MainLayout to handle collapsed state (optional - for content area adjustment):**

```tsx
// File: guiv2/src/renderer/components/layouts/MainLayout.tsx
// The sidebar handles its own width, so MainLayout may not need changes
// But if you want the content to be aware:

import { create } from 'zustand';

// Create a simple store or use context
export const useSidebarStore = create<{ isCollapsed: boolean; toggle: () => void }>((set) => ({
  isCollapsed: false,
  toggle: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
}));
```

---

### 3.2 Add Gradient to Active Nav Items

Already included in 3.1 above:
```tsx
isActive
  ? 'bg-gradient-to-r from-blue-600/20 to-transparent text-white border-l-4 border-blue-500'
  : 'text-gray-300'
```

---

### 4.1 Global CSS Additions

**File:** `guiv2/src/renderer/index.css`

Add at the end:

```css
/**
 * Enhanced Animation Utilities
 */
@keyframes pulse-glow {
  0%, 100% { 
    box-shadow: 0 0 5px rgba(0, 255, 255, 0.3), 0 0 10px rgba(0, 255, 255, 0.2); 
  }
  50% { 
    box-shadow: 0 0 10px rgba(0, 255, 255, 0.5), 0 0 20px rgba(0, 255, 255, 0.3); 
  }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes ripple {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-in-up {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
}

/**
 * Animation Classes
 */
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-shimmer {
  animation: shimmer 2s linear infinite;
}

.animate-ripple {
  animation: ripple 0.6s linear;
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}

.animate-slide-in-up {
  animation: slide-in-up 0.2s ease-out;
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

/**
 * Interaction Utilities
 */
@layer utilities {
  .hover-lift {
    @apply transition-all duration-200 ease-out;
  }
  .hover-lift:hover {
    @apply -translate-y-1;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }
  
  .focus-ring-glow:focus {
    @apply outline-none ring-2 ring-blue-500 ring-offset-2;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);
  }
  
  .active-scale:active {
    @apply scale-[0.98];
  }
  
  .glass-effect {
    @apply backdrop-blur-md bg-white/70 dark:bg-gray-900/70;
    @apply border border-white/20 dark:border-gray-700/50;
  }
}

/**
 * Scrollbar Enhancements (Dark mode aware)
 */
.dark ::-webkit-scrollbar-track {
  @apply bg-gray-800;
}

.dark ::-webkit-scrollbar-thumb {
  @apply bg-gray-600;
}

.dark ::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-500;
}
```

---

## ✅ VALIDATION CHECKLIST

After implementation, verify:

1. **TypeScript:** Run `npm run typecheck` or `tsc --noEmit` - no errors
2. **Build:** Run `npm run build` - successful compilation
3. **Visual Check:**
   - [ ] StatisticsCard hover indicator appears
   - [ ] ModernCard has subtle shadow, lifts on hover
   - [ ] StatusIndicator glows when online/success
   - [ ] Buttons have proper hover/active states
   - [ ] Sidebar collapses smoothly
   - [ ] Progress bars animate correctly
4. **Dark Mode:** Toggle theme and verify all enhancements work in both modes
5. **Accessibility:** Ensure focus states are visible, animations respect `prefers-reduced-motion`

---

## 🚫 DO NOT

- Do not remove existing `data-cy` or `data-testid` attributes
- Do not change component prop interfaces in breaking ways
- Do not add new npm dependencies without approval
- Do not modify business logic in hooks or services
- Do not change existing color values - only add new utility usage

---

## 📝 NOTES FOR AI IMPLEMENTATION

1. **Read files before editing** - Always `read_files` first to see current state
2. **Preserve existing functionality** - These are additive enhancements only
3. **Use `clsx` for conditional classes** - Already imported in all components
4. **Match existing patterns** - Follow the coding style in each file
5. **Test incrementally** - After each phase, verify the build succeeds
6. **Export new components** - Add Skeleton to atoms/index.ts if it exists

---

## 🏁 COMPLETION CRITERIA

The implementation is complete when:
1. All checklist items are marked done
2. TypeScript compiles without errors
3. Application builds successfully
4. Visual enhancements are visible in the UI
5. No regressions in existing functionality

---

*Generated from UI/UX Code Review - guiv2*
*Last Updated: $(date)*
