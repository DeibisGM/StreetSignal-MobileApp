export const Colors = {
  // Primary — Electric Blue
  primary: '#004ac6',
  onPrimary: '#ffffff',
  primaryContainer: '#2563eb',
  onPrimaryContainer: '#eeefff',
  inversePrimary: '#b4c5ff',
  primaryFixed: '#dbe1ff',
  primaryFixedDim: '#b4c5ff',
  onPrimaryFixed: '#00174b',
  onPrimaryFixedVariant: '#003ea8',

  // Secondary
  secondary: '#0060ac',
  onSecondary: '#ffffff',
  secondaryContainer: '#64a8fe',
  onSecondaryContainer: '#003c70',
  secondaryFixed: '#d4e3ff',
  secondaryFixedDim: '#a4c9ff',
  onSecondaryFixed: '#001c39',
  onSecondaryFixedVariant: '#004883',

  // Tertiary — Slate Navy
  tertiary: '#4d556b',
  onTertiary: '#ffffff',
  tertiaryContainer: '#656d84',
  onTertiaryContainer: '#eef0ff',
  tertiaryFixed: '#dae2fd',
  tertiaryFixedDim: '#bec6e0',
  onTertiaryFixed: '#131b2e',
  onTertiaryFixedVariant: '#3f465c',

  // Error
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',

  // Surfaces
  surface: '#f7f9fb',
  surfaceDim: '#d8dadc',
  surfaceBright: '#f7f9fb',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f2f4f6',
  surfaceContainer: '#eceef0',
  surfaceContainerHigh: '#e6e8ea',
  surfaceContainerHighest: '#e0e3e5',
  onSurface: '#191c1e',
  onSurfaceVariant: '#434655',
  inverseSurface: '#2d3133',
  inverseOnSurface: '#eff1f3',
  surfaceTint: '#0053db',
  surfaceVariant: '#e0e3e5',

  // Borders
  outline: '#737686',
  outlineVariant: '#c3c6d7',

  // Background
  background: '#f7f9fb',
  onBackground: '#191c1e',

  // Extended — status semantic colors not in the MD3 palette
  successContainer: '#d4edda',
  onSuccessContainer: '#155724',
  warningContainer: '#fff3cd',
  onWarningContainer: '#856404',
} as const;

/** Spacing scale based on the design system (all in px / dp) */
export const Spacing = {
  marginPage: 24,
  gutter: 16,
  stackSm: 8,
  stackMd: 16,
  stackLg: 32,
  stackXl: 48,
} as const;

/** Border-radius scale (matches Tailwind token names from design.md) */
export const BorderRadius = {
  sm: 4,    // rounded-sm
  md: 8,    // rounded
  lg: 12,   // rounded-md
  xl: 16,   // rounded-lg (inputs/buttons)
  xxl: 24,  // rounded-xl (secondary containers)
  card: 32, // primary card shape
  full: 9999,
} as const;

/** Typography scale (fontFamily 'Inter' when installed, else system default) */
export const Typography = {
  headlineXl: {
    fontSize: 40,
    fontWeight: '600' as const,
    lineHeight: 48,
    letterSpacing: -0.8,
  },
  headlineLg: {
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 38,
    letterSpacing: -0.64,
  },
  headlineLgMobile: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 34,
    letterSpacing: -0.28,
  },
  bodyMd: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySm: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  labelCaps: {
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 16,
    letterSpacing: 0.6,
  },
  labelMd: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
} as const;
