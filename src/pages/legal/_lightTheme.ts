// Inline CSS custom-property overrides that force the light theme on legal pages,
// regardless of the user's global dark/light mode preference.
// Spread this into the outermost wrapper div of every legal page.
export const LIGHT_THEME = {
  // ── CSS custom properties (force light values regardless of data-theme) ──
  '--bg':            '#ffffff',
  '--bg-secondary':  '#f8f8f7',
  '--bg-tertiary':   '#f0efed',
  '--bg-hover':      '#f3f2f0',
  '--bg-active':     '#ebebea',
  '--text':          '#111110',
  '--text-secondary':'#6b6b68',
  '--text-muted':    '#9b9b97',
  '--text-disabled': '#c8c8c4',
  '--text-inverse':  '#ffffff',
  '--border':        '#e5e5e2',
  '--border-hover':  '#d0d0cc',
  '--border-strong': '#b0b0ab',
  '--shadow-sm':     '0 1px 2px rgba(0,0,0,0.05)',
  '--shadow':        '0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
  '--shadow-md':     '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.04)',
  '--shadow-lg':     '0 8px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.04)',
  // ── Actual paint properties so the dark body doesn't bleed through ──
  background: '#ffffff',
  color:      '#111110',
} as unknown as React.CSSProperties
