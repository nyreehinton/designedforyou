# Model Context Protocol (MCP) for Replit Integration

## Overview

This Model Context Protocol (MCP) provides guidelines for integrating Replit-based application components into a Next.js content-ops-starter project. It ensures consistency, appropriate styling isolation, and proper component structure while respecting the existing application architecture.

> **Note**: This MCP complements the [global-mcp.md](./global-mcp.md) which provides the foundational guidelines for content operations and HTML-TSX pairing. When integrating Replit applications, ensure compliance with both protocols.

## Key Challenges

When integrating Replit applications into a Next.js project, several challenges must be addressed:

1. **CSS Scoping**: Replit applications often use global CSS, which can conflict with Next.js's CSS Modules approach
2. **Component Structure**: Converting standalone applications to fit within the component hierarchy
3. **TypeScript Integration**: Converting JavaScript components to TypeScript
4. **Asset Management**: Handling images and other static assets
5. **Build Process Compatibility**: Ensuring the integrated code doesn't break the Next.js build process
6. **Data Dependencies**: Managing data imports and dependencies between components
7. **Routing and Navigation**: Ensuring proper navigation between integrated components

## Integration Protocol

### 1. Directory Structure

- Place all integrated components in a dedicated directory: `src/components/[application-name]/`
- Organize components into logical subdirectories:

  ```
  src/components/[application-name]/
  ├── layout/           # Layout components (Sidebar, TopBar, etc.)
  ├── ui/               # UI components (buttons, tooltips, etc.)
  ├── overview/         # Main dashboard/overview components
  ├── [feature-name]/   # Feature-specific components
  └── [AppName]Page.tsx # Main page component
  ```

- Place styles in an appropriate location:

  ```
  src/styles/
  └── [AppName].module.css # CSS Module for the application
  ```

- Create a page entry point:

  ```
  src/pages/
  └── [application-name].tsx # Page component that renders the application
  ```

### 2. CSS Integration Strategy

- **Use CSS Modules**: Convert all global CSS to CSS Modules to prevent style leakage:

  ```css
  /* [AppName].module.css */
  .root {
    /* CSS variables scoped to this component */
    --app-primary-color: #0a2856;
    --app-secondary-color: #c19b4a;
    /* etc. */
  }

  .container {
    /* Container styles */
  }
  ```

- **No Global Styles**: Avoid adding global style imports in components:

  ```tsx
  // INCORRECT
  import '../styles/global.css'; // Don't do this in components

  // CORRECT
  import styles from '@/styles/[AppName].module.css';
  ```

- **CSS Variables Scoping**: Place CSS variables within a root class selector:

  ```css
  /* INCORRECT */
  :root {
    --app-color: blue;
  }

  /* CORRECT */
  .root {
    --app-color: blue;
  }
  ```

- **Variable Naming**: Prefix all CSS variables with application-specific prefixes to avoid collisions:

  ```css
  .root {
    --tb-primary: #0a2856; /* For ThirdBridge */
    --app-primary: #0a2856; /* For your specific app */
  }
  ```

- **CSS Class Replacements**: Replace component-specific utility classes with application-wide CSS module classes:

  ```tsx
  // INCORRECT (using component-specific classes)
  <div className="shadow-card hover:shadow-card-hover">

  // CORRECT (using application CSS module)
  <div className={styles.card}>
  ```

- **Tailwind Integration**: When using Tailwind CSS alongside CSS modules, ensure class names don't conflict:

  ```tsx
  // Example of using both Tailwind and CSS module classes
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${styles.statsContainer}`}>
  ```

### 3. Component Conversion Process

1. **Copy Core Files**: Copy the essential application files from the Replit project
2. **Convert to TypeScript**: Add type definitions and convert to `.tsx` files
3. **Update Imports**: Adjust import paths to match the Next.js project structure
4. **Add CSS Modules**: Convert styles to CSS Modules and update references
5. **Image Paths**: Update image references to use the public directory

#### TypeScript Conversion Example

```jsx
// Original JavaScript
import React, { useState } from 'react';
import './styles.css';

function MyComponent({ title, items }) {
  const [active, setActive] = useState(false);

  return (
    <div className="container">
      <h1>{title}</h1>
      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      <button onClick={() => setActive(!active)}>{active ? 'Active' : 'Inactive'}</button>
    </div>
  );
}
```

```tsx
// Converted TypeScript with CSS Modules
import React, { useState } from 'react';
import styles from '@/styles/[AppName].module.css';

interface Item {
  id: string;
  name: string;
}

interface MyComponentProps {
  title: string;
  items: Item[];
}

function MyComponent({ title, items }: MyComponentProps) {
  const [active, setActive] = useState(false);

  return (
    <div className={`${styles.root} ${styles.container}`}>
      <h1 className={styles.title}>{title}</h1>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id} className={styles.listItem}>
            {item.name}
          </li>
        ))}
      </ul>
      <button className={`${styles.button} ${active ? styles.active : ''}`} onClick={() => setActive(!active)}>
        {active ? 'Active' : 'Inactive'}
      </button>
    </div>
  );
}
```

### 4. Asset Management

- Place all images and static assets in the public directory:

  ```
  public/
  └── images/
      └── [application-name]/
          ├── image1.jpg
          ├── image2.png
          └── ...
  ```

- Update image references in components:

  ```tsx
  // INCORRECT
  <img src="./images/logo.png" />

  // CORRECT
  <img src="/images/[application-name]/logo.png" />
  ```

- Add fallback handling for images:

  ```tsx
  <img
    src="/images/[application-name]/logo.png"
    alt="Logo"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.src = 'https://placehold.co/400x300?text=Logo';
    }}
  />
  ```

- Prefer static imports for critical assets:

  ```tsx
  // For critical assets that should be part of the build
  import logoImage from '@/public/images/logo.png';

  // Then use with Next.js Image component
  import Image from 'next/image';

  <Image src={logoImage} alt="Logo" width={200} height={50} />;
  ```

### 5. Component Integration

- Create a main page component to render the application:

  ```tsx
  // src/pages/[application-name].tsx
  import Head from 'next/head';
  import [AppName]Page from '@/components/[application-name]/[AppName]Page';

  export default function [AppName]Platform() {
    return (
      <>
        <Head>
          <title>[AppName] Platform</title>
          <meta name="description" content="[AppName] platform" />
          {/* Add any required external stylesheets here */}
        </Head>
        <[AppName]Page />
      </>
    );
  }
  ```

- If external libraries are required, add them to the Head component:

  ```tsx
  <Head>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
  </Head>
  ```

### 6. Compatibility Layer

If the original application uses incompatible structures or approaches, create a compatibility layer:

```tsx
// src/components/[application-name]/[AppName].tsx
// This acts as a compatibility wrapper for legacy code

import React from 'react';
import [AppName]Page from './[AppName]Page';

/**
 * [AppName] compatibility component
 * This redirects to the new implementation for backward compatibility
 */
const [AppName]: React.FC = () => {
  return <[AppName]Page />;
};

export default [AppName];
```

### 7. Data Integration & Dependencies

- Create a dedicated data directory for application data:

  ```
  src/lib/
  └── data/
      └── [application-name]/
          ├── mock-data.js
          ├── api-integration.js
          └── utilities.js
  ```

- Use TypeScript interfaces for data structures:

  ```tsx
  // src/lib/data/types.ts
  export interface InterviewData {
    title: string;
    date: string;
    description: string;
    industry: string;
  }

  export interface IndustryData {
    name: string;
    count: number;
    growth: number;
  }
  ```

- Handle mock data for development and testing:

  ```tsx
  // src/lib/data/mock-data.ts
  import { InterviewData } from './types';

  export const interviews: InterviewData[] = [
    {
      title: 'Industry Interview',
      date: '2025-01-15',
      description: 'Interview with industry experts',
      industry: 'Technology'
    }
    // Additional mock data
  ];
  ```

- Ensure data is properly imported in components:

  ```tsx
  // In your component
  import { interviews } from '@/lib/data/mock-data';
  // Or for API data
  import { fetchInterviews } from '@/lib/data/api-integration';
  ```

### 8. Navigation & State Management

- Create a consistent navigation pattern for multi-section applications:

  ```tsx
  // src/components/[application-name]/[AppName]Page.tsx
  export default function [AppName]Page() {
    const [activeSection, setActiveSection] = useState('overview');

    // Navigation state handler
    const renderContent = () => {
      switch (activeSection) {
        case 'overview':
          return <Overview setActiveSection={setActiveSection} />;
        case 'details':
          return <Details setActiveSection={setActiveSection} />;
        default:
          return <Overview setActiveSection={setActiveSection} />;
      }
    };

    return (
      <div className={styles.container}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <main className={styles.content}>
          {renderContent()}
        </main>
      </div>
    );
  }
  ```

- Pass navigation functions to child components:

  ```tsx
  // Child component with navigation capabilities
  interface OverviewProps {
    setActiveSection: (section: string) => void;
  }

  const Overview: React.FC<OverviewProps> = ({ setActiveSection }) => {
    return (
      <div>
        <h1>Overview</h1>
        <button onClick={() => setActiveSection('details')}>View Details</button>
      </div>
    );
  };
  ```

## Common Integration Nuances & Pitfalls

### 1. Component Import and Initialization Issues

**Problem**: Components don't render or initialize properly when integrated into a larger application.

**Solution**:

- Ensure component paths are correct (check for case sensitivity)
- Verify that all required props are being passed
- Check for initialization order dependencies
- Use React DevTools to inspect component hierarchy

**Example Fix**:

```tsx
// Check component import path
import Overview from '@/components/thirdbridge/overview/Overview';
// NOT: import Overview from '@/components/thirdbridge/Overview';

// Ensure all required props are passed
<Overview setActiveSection={setActiveSection} />;
// NOT: <Overview />
```

### 2. Chart and Visualization Library Issues

**Problem**: Charts or visualizations don't render properly or cause crashes.

**Solution**:

- Use `useRef` and `useEffect` for proper DOM access and cleanup
- Ensure canvas elements are properly sized
- Clean up chart instances on unmount to prevent memory leaks

**Example Fix**:

```tsx
const chartRef = useRef<HTMLCanvasElement>(null);
const chartInstance = useRef<Chart | null>(null);

useEffect(() => {
  if (chartRef.current) {
    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {...});
    }
  }

  // Clean up on component unmount
  return () => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
  };
}, [dependencies]);
```

### 3. CSS Module Conflicts with Tailwind

**Problem**: Tailwind utility classes conflict with CSS module styling, leading to inconsistent appearance.

**Solution**:

- Use CSS module classes for component-specific styling
- Use Tailwind for layout and basic utilities
- Wrap Tailwind classes in a specific container with CSS module styling

**Example Fix**:

```tsx
// CSS Module (ThirdBridge.module.css)
.cardContainer {
  border-radius: var(--tb-radius-lg);
  overflow: hidden;
  box-shadow: var(--tb-shadow-md);
}

// Component
<div className={`bg-white p-6 ${styles.cardContainer}`}>
  <h2 className="text-xl font-bold text-gray-800">Card Title</h2>
  <p className="text-gray-600">Card content</p>
</div>
```

### 4. Data Lifecycle and Availability

**Problem**: Components fail to render because data isn't available when needed.

**Solution**:

- Add proper loading states
- Ensure data files are in the correct location
- Use conditional rendering to handle missing data gracefully
- Implement fallback data for development

**Example Fix**:

```tsx
// Data file (ensure it exists and is properly exported)
// src/lib/data.js
export const interviews = [...];

// Component
const [loading, setLoading] = useState(true);
const [data, setData] = useState([]);

useEffect(() => {
  try {
    setData(interviews);
  } catch (error) {
    console.error("Data loading error:", error);
    // Fallback data
    setData([{title: "Sample Interview", date: "2025-01-01"}]);
  } finally {
    setLoading(false);
  }
}, []);

// Render with loading state
return (
  <div>
    {loading ? (
      <p>Loading data...</p>
    ) : (
      data.map(item => <InterviewCard key={item.title} {...item} />)
    )}
  </div>
);
```

### 5. Navigation State Synchronization

**Problem**: Navigation state doesn't sync properly between components.

**Solution**:

- Use a centralized state management approach
- Pass setActiveSection functions consistently
- Ensure default states are consistent

**Example Fix**:

```tsx
// Parent component
const [activeSection, setActiveSection] = useState('overview');

// Pass to children
<Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
<MainContent activeSection={activeSection} setActiveSection={setActiveSection} />

// Child component - make sure to use the passed function
const FeatureCard = ({ title, setActiveSection }) => (
  <div className={styles.card}>
    <h3>{title}</h3>
    <button onClick={() => setActiveSection('details')}>View Details</button>
  </div>
);
```

### 6. External Library Integration

**Problem**: External libraries like Chart.js or third-party UI components don't initialize correctly.

**Solution**:

- Check for required peer dependencies
- Import libraries correctly for Next.js (dynamic imports when needed)
- Handle SSR compatibility

**Example Fix**:

```tsx
// For client-side only libraries
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('chart.js').then((mod) => mod.Chart), { ssr: false });

// Or for components that use browser APIs
const ChartComponent = dynamic(() => import('../components/ChartComponent'), { ssr: false });
```

### 7. Component Mounting and Cleanup

**Problem**: Components cause memory leaks or errors on page navigation.

**Solution**:

- Implement proper cleanup in useEffect
- Cancel pending API calls
- Dispose of any timers, intervals, or event listeners

**Example Fix**:

```tsx
useEffect(() => {
  const controller = new AbortController();
  const { signal } = controller;

  const fetchData = async () => {
    try {
      const response = await fetch('/api/data', { signal });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Fetch error:', error);
      }
    }
  };

  fetchData();

  const interval = setInterval(() => {
    // Periodic updates
  }, 5000);

  return () => {
    controller.abort(); // Cancel fetch requests
    clearInterval(interval); // Clear intervals
    // Any other cleanup
  };
}, []);
```

## Testing Protocol

1. **Visual Inspection**: Compare the integrated application with the original Replit version
2. **Functionality Testing**: Verify all features work as expected
3. **Build Testing**: Ensure the Next.js build process completes successfully
4. **Responsive Testing**: Check behavior on different screen sizes
5. **Style Isolation**: Confirm styles don't leak into other components
6. **Navigation Testing**: Verify all navigation paths work correctly
7. **Data Flow Testing**: Ensure data is properly passed between components
8. **Error Handling**: Test component behavior with missing or invalid data

## Integration Checklist

- [ ] Create component and style directories
- [ ] Convert CSS to CSS Modules with scoped variables
- [ ] Update import paths for all components
- [ ] Add TypeScript interfaces and type definitions
- [ ] Create page component in pages directory
- [ ] Move assets to public directory and update references
- [ ] Add error handling for assets and data
- [ ] Create/update data files and imports
- [ ] Implement proper navigation state management
- [ ] Add loading states and error boundaries
- [ ] Test build process
- [ ] Visual comparison with original application
- [ ] Test functionality across all sections
- [ ] Check responsive behavior
- [ ] Verify proper cleanup on component unmount

## Example Integration

The ThirdBridge integration serves as a reference implementation of this protocol:

```
src/components/thirdbridge/
├── ThirdBridgePage.tsx         # Main component
├── ThirdBridge.tsx             # Compatibility component
├── layout/
│   ├── Sidebar.tsx             # Navigation sidebar
│   └── TopBar.tsx              # Top navigation bar
├── overview/
│   └── Overview.tsx            # Overview dashboard component
├── ui/
│   ├── Tabs.tsx                # Tabs component
│   └── Tooltip.tsx             # Tooltip component
└── featured-analysis/
    ├── FeaturedAnalysisSection.tsx
    └── ... other components

src/lib/
└── data.js                     # Shared data for components

src/styles/
└── ThirdBridge.module.css      # CSS Module with scoped variables

src/pages/
└── thirdbridge.tsx             # Page component

public/images/thirdbridge/
└── ... image assets
```

### 9. Next.js Pages Integration

- **Understand the Next.js Routing System**:

  - Pages Router vs App Router
  - Static Generation (SSG) vs Server-Side Rendering (SSR)
  - Client-side navigation patterns

- **Static Generation with Pages Router**:

  ```tsx
  // Simple static page
  export default function MyPage() {
    return <div>Static content</div>;
  }

  // With getStaticProps for data fetching
  export async function getStaticProps() {
    return {
      props: {
        data: [...],
      },
    };
  }
  ```

- **DO NOT Use App Router Directives in Pages Router**:

  ```tsx
  // INCORRECT: Mixing App Router directives with Pages Router
  'use client'; // Don't include this in pages using Pages Router

  // CORRECT: Standard Pages Router pattern
  import { useState } from 'react';

  export default function MyPage() {
    const [state, setState] = useState(initialState);
    // ...
  }
  ```

- **Route Integration**:
  - Each page should correspond to a route
  - For dynamic routes, use appropriate file naming (e.g., `[id].tsx`)
  - Implement proper navigation between pages

By following this Model Context Protocol, you can efficiently integrate Replit applications into the content-ops-starter project while maintaining code quality, style isolation, and compatibility with the existing infrastructure.
