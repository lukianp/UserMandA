/**
 * CSS Module Type Declarations
 * Allows importing CSS files without TypeScript errors
 */

declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'ag-grid-community/styles/ag-grid.css';
declare module 'ag-grid-community/styles/ag-theme-alpine.css';
declare module 'ag-grid-community/styles/ag-theme-balham.css';
declare module 'ag-grid-community/styles/ag-theme-material.css';


