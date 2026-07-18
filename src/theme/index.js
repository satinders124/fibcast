// ─────────────────────────────────────────────────────────────
// Fibcast Design System — "Obsidian Fiber"
// Deep-space navy canvas, fiber-optic blue→cyan accents.
// Token names are stable: screens import Colors / Status / avatarColors.
// ─────────────────────────────────────────────────────────────

export const Colors = {
  // Canvas layers (deep → raised)
  bg:        '#05080F',   // app canvas — near-black navy
  bgMid:     '#0A1120',   // headers / raised surface
  card:      '#0E1729',   // cards & inputs
  cardAlt:   '#121F36',   // interactive / pressed surface (was cardHov)
  cardHov:   '#121F36',   // legacy alias kept for compatibility
  tabBar:    '#070C16',   // bottom navigation chrome

  // Brand accents
  blue:      '#2563EB',   // primary action
  indigo:    '#4F46E5',   // gradient depth
  violet:    '#7C3AED',   // premium highlight
  cyan:      '#06B6D4',   // secondary accent / links
  cyanSoft:  '#22D3EE',   // bright cyan for glow/metrics

  // Text
  white:     '#F8FAFF',   // primary text
  off:       '#C9D4E8',   // secondary text
  muted:     '#7E8CA3',   // tertiary text / placeholders
  faint:     '#4B5872',   // disabled / hairline text

  // Semantic
  green:     '#10B981',
  red:       '#EF4444',
  redSoft:   '#F87171',
  yellow:    '#F59E0B',

  // Lines & glows
  border:    'rgba(148,163,184,0.11)',
  borderH:   'rgba(6,182,212,0.38)',   // highlighted/focused lines
  glass:     'rgba(255,255,255,0.05)', // subtle overlay on dark
  scrim:     'rgba(3,6,12,0.72)',      // modal backdrop
};

// Gradient stops — feed straight into <LinearGradient colors={...}>
export const Gradients = {
  brand:     ['#2563EB', '#4F46E5'],            // buttons, logo mark
  hero:      ['#1E40AF', '#4F46E5', '#0E7490'], // dashboard command card
  accent:    ['#06B6D4', '#2563EB'],
  premium:   ['#7C3AED', '#2563EB'],
  surface:   ['rgba(37,99,235,0.16)', 'rgba(6,182,212,0.05)'],
  tabGlow:   ['rgba(6,182,212,0.20)', 'rgba(6,182,212,0.06)'],
};

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  26,
  pill: 999,
};

// Consistent elevation — iOS shadows + Android elevation pairs
export const Shadow = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  glow: (color = Colors.blue) => ({
    shadowColor: color,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  }),
  soft: {
    shadowColor: '#000000',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

// Type scale — consistent hierarchy everywhere
export const Type = {
  display: { fontSize: 28, fontWeight: '900', letterSpacing: -0.8, color: Colors.white },
  title:   { fontSize: 22, fontWeight: '900', letterSpacing: -0.6, color: Colors.white },
  heading: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, color: Colors.white },
  body:    { fontSize: 14, fontWeight: '500', color: Colors.off },
  caption: { fontSize: 12, fontWeight: '600', color: Colors.muted },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.4, textTransform: 'uppercase', color: Colors.cyan },
};

export const Status = {
  Active:   { bg: 'rgba(16,185,129,0.12)', text: '#34D399', border: 'rgba(16,185,129,0.30)' },
  Inactive: { bg: 'rgba(239,68,68,0.12)',  text: '#F87171', border: 'rgba(239,68,68,0.30)'  },
  Pending:  { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', border: 'rgba(245,158,11,0.30)' },
  Paid:     { bg: 'rgba(16,185,129,0.12)', text: '#34D399', border: 'rgba(16,185,129,0.30)' },
  Unpaid:   { bg: 'rgba(239,68,68,0.12)',  text: '#F87171', border: 'rgba(239,68,68,0.30)'  },
};

// Avatar palette — tuned against the dark canvas
export const avatarColors = ['#2563EB', '#4F46E5', '#0891B2', '#7C3AED', '#059669', '#DC2626', '#D97706'];
