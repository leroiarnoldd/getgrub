// Central palette — calm, minimal scheme: warm cream, navy, grey, white.
// Food photography provides the colour; the chrome stays quiet.
export const colors = {
  bg: '#FAF7F2',        // warm cream app background
  card: '#FFFFFF',      // white cards
  text: '#1A1A2E',      // primary navy text / actions
  textMuted: '#6B7280', // secondary grey
  textFaint: '#9CA3AF', // tertiary / placeholders
  border: '#ECEAE4',    // subtle warm border
  divider: '#F3F1EC',
  accent: '#1A1A2E',    // primary action colour (navy)
  gold: '#F5B301',      // lightning / deal highlight
  success: '#16A34A',
  danger: '#DC2626',
} as const;

// One flat, transparent booking fee — shown before you book, charged only on a
// successful booking. No percentage fees (our core difference vs EatClub).
export const BOOKING_FEE_GBP = 1.5;
