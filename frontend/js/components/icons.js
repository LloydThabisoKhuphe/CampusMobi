/* =============================================================================
   components/icons.js
   -----------------------------------------------------------------------------
   Small hand-drawn SVG icons so the app doesn't need an icon font/library.
   Add a new one by adding a case below and calling icon("name").
   ============================================================================= */

const COMMON_ATTRS = 'width="20" height="20" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';

const PATHS = {
  home: '<path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v9h13v-9" />',
  id: '<rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="12" r="2" /><path d="M14 10h4M14 14h4" />',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18" /><circle cx="16.5" cy="14" r="1.4" />',
  map: '<path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" /><path d="M9 4v13M15 6.5v13" />',
  bell: '<path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 3h16l-2-3Z" /><path d="M10 21a2 2 0 0 0 4 0" />',
};

// Returns an <svg> as an HTML string, ready to drop into a template.
export function icon(name) {
  const inner = PATHS[name];
  if (!inner) return "";
  return `<svg ${COMMON_ATTRS}>${inner}</svg>`;
}
