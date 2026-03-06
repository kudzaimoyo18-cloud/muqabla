// Muqabla Brand Colors
// Deep Teal + Gold - Professional & Trustworthy for GCC market

export const colors = {
  // Primary palette
  primary: '#0D7377',        // Deep Teal - trust, professionalism
  primaryLight: '#14919B',   // Lighter teal for hover/active states
  primaryDark: '#095759',    // Darker teal for text on light bg

  // Accent
  accent: '#C9A227',         // Warm Gold - GCC luxury, success
  accentLight: '#E5C44D',    // Lighter gold
  accentDark: '#9A7B1D',     // Darker gold

  // Backgrounds
  background: '#FAFAFA',     // Off-white main background
  surface: '#FFFFFF',        // Cards, modals
  surfaceSecondary: '#F3F4F6', // Secondary surface

  // Text
  text: '#1A1A2E',           // Primary text - near black
  textSecondary: '#6B7280',  // Secondary text - gray
  textTertiary: '#9CA3AF',   // Tertiary text - light gray
  textInverse: '#FFFFFF',    // Text on dark backgrounds

  // Semantic colors
  success: '#2ECC71',        // Green - verified, success
  error: '#E74C3C',          // Red - errors, delete
  warning: '#F39C12',        // Orange - warnings
  info: '#3498DB',           // Blue - info

  // Status colors
  verified: '#0D7377',       // Verified badge
  pending: '#F39C12',        // Pending status
  active: '#2ECC71',         // Active status
  inactive: '#9CA3AF',       // Inactive/paused

  // Borders
  border: '#E5E7EB',         // Light border
  borderDark: '#D1D5DB',     // Darker border

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',      // Modal overlay
  overlayLight: 'rgba(0, 0, 0, 0.3)', // Light overlay
};

// Gradient presets
export const gradients = {
  primary: ['#0D7377', '#14919B'],
  accent: ['#C9A227', '#E5C44D'],
  dark: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0)'],
  light: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0)'],
};

// Shadow presets
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};
