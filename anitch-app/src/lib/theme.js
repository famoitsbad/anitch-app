// ─── ANITCH BRAND THEME ───────────────────────────────────────────────
// Based on official Anitch Brand Guidelines v1.1 March 2026

export const theme = {
  // Brand Colors
  green:        '#004B39',   // Anitch Green — PANTONE 342 C (primary)
  greenDark:    '#003328',   // darker shade
  greenMid:     '#1A6B54',   // mid shade
  greenLight:   '#E8F2EE',   // very light green tint
  greenSoft:    '#C5D9D3',   // soft green for backgrounds

  orange:       '#F7984C',   // Anitch Orange — PANTONE 144 C
  orangeLight:  '#FEF0E3',   // light orange tint
  orangeDark:   '#E07830',
  greenSoft:    '#C5D9D3',   // soft border green
  greenDark:    '#003328',

  pink:         '#F797BC',   // Anitch Pink — PANTONE 211 C
  pinkLight:    '#FDE8F2',   // light pink tint

  cream:        '#F7EBD5',   // warm cream (from brand color app examples)
  black:        '#000000',
  white:        '#FFFFFF',
  lightGrey:    '#F9F9FB',   // brand light grey

  // Text
  textPrimary:  '#000000',
  textSecondary:'#3D3D3D',
  textMuted:    '#888888',
  textLight:    '#AAAAAA',

  // Borders
  border:       '#E8E8E8',
  borderLight:  '#F0F0F0',

  // Severity colors (clinical but on-brand)
  sevMild:      '#F7EBD5',   // cream — mild
  sevModerate:  '#F7984C',   // orange — moderate
  sevSevere:    '#C0392B',   // red — severe

  // Shadows
  shadow:       'rgba(0,75,57,0.08)',
  shadowMd:     'rgba(0,75,57,0.12)',
}

// Typography
export const fonts = {
  heading: "'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  body:    "'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  label:   "'Roboto', 'Lato', Arial, sans-serif",
}

// Shared component styles
export const shared = {
  page: {
    padding: '16px 16px 100px',
    maxWidth: '500px',
    margin: '0 auto',
    background: theme.lightGrey,
    minHeight: '100vh',
  },
  card: {
    background: theme.white,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: `0 1px 4px ${theme.shadow}`,
  },
  cardLabel: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: theme.textMuted,
    marginBottom: '12px',
    fontFamily: fonts.label,
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: '4px',
    fontFamily: fonts.heading,
    letterSpacing: '-0.02em',
  },
  pageSub: {
    fontSize: '13px',
    color: theme.textMuted,
    marginBottom: '20px',
    fontFamily: fonts.body,
  },
  primaryBtn: {
    width: '100%',
    background: theme.green,
    color: theme.white,
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: fonts.body,
    letterSpacing: '0.04em',
    transition: 'all 0.2s',
  },
  chip: {
    padding: '6px 12px',
    border: `1.5px solid ${theme.border}`,
    borderRadius: '6px',
    fontSize: '12px',
    color: theme.textSecondary,
    cursor: 'pointer',
    background: theme.white,
    fontFamily: fonts.body,
    fontWeight: '500',
    transition: 'all 0.15s',
  },
  chipOn: {
    background: theme.green,
    borderColor: theme.green,
    color: theme.white,
  },
}
