// TODO(BC, 2024-07-29): remove isTouchscreen import when theming context is fully implemented
// For now, we need it to resolve conditional colors directly within this file.
import { isTouchscreen } from '../ui-style-constants/responsiveness'

// Base colors are the literal color values.
// We define them here to avoid repetition and for easier mapping to semantic tokens.
// Non-touchscreen values are used as defaults where applicable, and touchscreen variations are handled in themes.
const baseColors = {
  // Greens
  green60: '#03683E',
  green50: '#04AA65',
  green50Touch: '#1CA850',
  green40: '#91E2C0',
  green40Touch: '#8EF3A8',
  green35: '#AFEDD3',
  green35Touch: '#8AFBAB',
  green30: '#C4F6E0',
  green20: '#E8F7ED',

  // Reds
  red60: '#941313',
  red55: '#C71A1B',
  red50: '#DE1B1B',
  red40: '#F5B2B3',
  red35: '#F8C8C9',
  red30: '#FAD6D6',
  red20: '#FCE9E9',

  // Yellows
  yellow60: '#825512',
  yellow50: '#F09D20',
  yellow40: '#FCD48B',
  yellow35: '#FFE1A4',
  yellow30: '#FFE9BE',
  yellow20: '#FDF3E2',

  // Purples
  purple60: '#562566',
  purple60Touch: '#612367',
  purple55: '#713187',
  purple55Touch: '#822E89',
  purple50: '#893BA4',
  purple50Touch: '#9E39A8',
  purple40: '#CEA4DF',
  purple40Touch: '#E2A9EA',
  purple35: '#DBBCE7',
  purple35Touch: '#ECC2F2',
  purple30: '#E6D5EC',
  purple30Touch: '#F4DEF7',
  purple20: '#F1E8F5',
  purple20Touch: '#FFF3FE',

  // Blues
  blue60: '#004196',
  blue55: '#0056C8', // Note: current colors.ts has blue50 listed twice, one is #006CFA
  blue50core: '#006CFA', // Renamed to avoid clash, used as primary in example
  blue40: '#A9CEFD',
  blue35: '#BFDCFD',
  blue30: '#D0E6FE',
  blue20: '#E1EFFF',
  blue10: '#F1F8FF',

  // Greys
  grey60: '#4A4C4E',
  grey55: '#626467',
  grey50: '#737578',
  grey40: '#B7B8B9',
  grey35: '#CBCCCC',
  grey30: '#DEDEDE',
  grey20: '#E9E9E9',
  grey10: '#F3F3F3',

  // Core
  black90: '#16212D',
  black80: '#24313F',
  black70: '#39495B',
  white: '#FFFFFF',

  // Flex (these seem specific, might need better semantic names or to be deprecated)
  flex40: '#aae3fc',
  flex55: '#0297CC',
  flex50: '#00BDFF',

  // Extras
  transparent: '#00000000',
}

export interface ColorTokens {
  // Core UI
  primary: string
  primaryDisabled: string // For disabled primary elements
  secondary: string
  accent: string // Often the same as primary or a distinct color

  // Backgrounds
  background: string // Main app background
  backgroundHover: string // For subtle background interactions
  surface: string // Cards, modals, sidebars
  surfaceHover: string // Hover state for surfaces
  surfaceSubdued: string // For less prominent surfaces
  surfaceElevated: string // Elevated surfaces like dropdowns

  // Text
  text: string // Primary text
  textSecondary: string // Secondary/muted text
  textDisabled: string
  textOnPrimary: string // Text on primary background (e.g., on a primary button)
  textOnDark: string // For text that needs to be light on a dark custom background
  textLink: string // For hyperlinks

  // Borders
  border: string
  borderFocus: string
  borderSeparator: string // For separating elements or sections

  // Status & Feedback
  success: string
  successText: string // Text on success background
  warning: string
  warningText: string // Text on warning background
  error: string
  errorText: string // Text on error background
  info: string
  infoText: string // Text on info background

  // UI Elements
  inputBackground: string
  inputBorder: string
  inputText: string
  inputPlaceholder: string
  buttonDisabledBackground: string
  buttonDisabledText: string
  
  // Opentrons Specific
  deckSlot: string
  moduleBackground: string
  moduleBorder: string
  wellBackground: string
  wellBorder: string
  transparentOverlay: string // For overlays like modal backdrop

  // Icons & Glyphs
  icon: string
  iconDisabled: string
  iconHover: string
  iconActive: string // For selected or active icons

  // Interactive Elements (examples, expand as needed)
  interactivePrimary: string
  interactivePrimaryHover: string
  interactiveSecondary: string
  interactiveSecondaryHover: string

  // Specific component colors (try to keep these minimal)
  // These are mapped from the original color names that don't have obvious semantic replacements yet.
  // Consider deprecating or finding better semantic names for these over time.
  deprecatedBlue55: string // original blue55
  deprecatedFlex40: string
  deprecatedFlex55: string
  deprecatedFlex50: string

  // Greens (example shades, if direct use is still needed)
  green60: string
  green50: string
  green40: string
  green35: string
  green30: string
  green20: string

  // Reds
  red60: string
  red55: string
  red50: string
  red40: string
  red35: string
  red30: string
  red20: string

  // Yellows
  yellow60: string
  yellow50: string
  yellow40: string
  yellow35: string
  yellow30: string
  yellow20: string

  // Purples
  purple60: string
  purple55: string
  purple50: string
  purple40: string
  purple35: string
  purple30: string
  purple20: string

  // Blues (additional shades)
  blue60: string
  // blue50 is primary
  blue40: string
  blue35: string
  blue30: string
  blue20: string
  blue10: string

  // Greys (additional shades)
  grey60: string
  grey55: string
  grey50: string
  grey40: string
  grey35: string
  grey30: string
  grey20: string
  grey10: string

  // Core (additional shades)
  black90: string
  black80: string
  black70: string
  white: string
  
  // Transparent helpers
  transparent: string
  transparentWhite80: string
  transparentWhite50: string
  transparentBlack80: string
}

export interface OpentronsTheme {
  colors: ColorTokens
  name: 'light' | 'dark'
  // Future: typography, spacing, etc.
  // For now, we pass isTouchscreen to allow conditional color resolution
  // This is a temporary measure. Ideally, ThemeProvider would handle this context.
  isTouchscreen: boolean
}

export const lightTheme: OpentronsTheme = {
  name: 'light',
  isTouchscreen: isTouchscreen, // Set based on the imported value
  colors: {
    // Core UI
    primary: baseColors.blue50core,
    primaryDisabled: baseColors.blue30,
    secondary: baseColors.grey50, // Example, adjust as needed
    accent: isTouchscreen ? baseColors.green50Touch : baseColors.green50,

    // Backgrounds
    background: baseColors.white,
    backgroundHover: baseColors.grey10,
    surface: baseColors.grey10, // Or white for very light themes
    surfaceHover: baseColors.grey20,
    surfaceSubdued: baseColors.grey10,
    surfaceElevated: baseColors.white,

    // Text
    text: baseColors.black90,
    textSecondary: baseColors.grey55,
    textDisabled: baseColors.grey40,
    textOnPrimary: baseColors.white,
    textOnDark: baseColors.white, // For custom dark bg components
    textLink: baseColors.blue50core,

    // Borders
    border: baseColors.grey30,
    borderFocus: baseColors.blue50core,
    borderSeparator: baseColors.grey20,

    // Status & Feedback
    success: isTouchscreen ? baseColors.green50Touch : baseColors.green50,
    successText: baseColors.white, // Assuming success color is dark enough
    warning: baseColors.yellow50,
    warningText: baseColors.black90, // Yellow often needs dark text
    error: baseColors.red50,
    errorText: baseColors.white,
    info: baseColors.blue50core,
    infoText: baseColors.white,

    // UI Elements
    inputBackground: baseColors.white,
    inputBorder: baseColors.grey30,
    inputText: baseColors.black90,
    inputPlaceholder: baseColors.grey50,
    buttonDisabledBackground: baseColors.grey30,
    buttonDisabledText: baseColors.grey50,

    // Opentrons Specific
    deckSlot: baseColors.grey30,
    moduleBackground: baseColors.grey20, // Or grey10
    moduleBorder: baseColors.grey30,
    wellBackground: baseColors.white,
    wellBorder: baseColors.grey40,
    transparentOverlay: `${baseColors.black90}80`, // transparentBlack80

    // Icons & Glyphs
    icon: baseColors.grey55,
    iconDisabled: baseColors.grey30,
    iconHover: baseColors.grey60,
    iconActive: baseColors.blue50core,

    // Interactive Elements
    interactivePrimary: baseColors.blue50core,
    interactivePrimaryHover: baseColors.blue55,
    interactiveSecondary: baseColors.grey50,
    interactiveSecondaryHover: baseColors.grey55,
    
    // Deprecated/Direct Mappings
    deprecatedBlue55: baseColors.blue55,
    deprecatedFlex40: baseColors.flex40,
    deprecatedFlex55: baseColors.flex55,
    deprecatedFlex50: baseColors.flex50,

    // Greens
    green60: baseColors.green60,
    green50: isTouchscreen ? baseColors.green50Touch : baseColors.green50,
    green40: isTouchscreen ? baseColors.green40Touch : baseColors.green40,
    green35: isTouchscreen ? baseColors.green35Touch : baseColors.green35,
    green30: baseColors.green30,
    green20: baseColors.green20,

    // Reds
    red60: baseColors.red60,
    red55: baseColors.red55,
    red50: baseColors.red50,
    red40: baseColors.red40,
    red35: baseColors.red35,
    red30: baseColors.red30,
    red20: baseColors.red20,

    // Yellows
    yellow60: baseColors.yellow60,
    yellow50: baseColors.yellow50,
    yellow40: baseColors.yellow40,
    yellow35: baseColors.yellow35,
    yellow30: baseColors.yellow30,
    yellow20: baseColors.yellow20,

    // Purples
    purple60: isTouchscreen ? baseColors.purple60Touch : baseColors.purple60,
    purple55: isTouchscreen ? baseColors.purple55Touch : baseColors.purple55,
    purple50: isTouchscreen ? baseColors.purple50Touch : baseColors.purple50,
    purple40: isTouchscreen ? baseColors.purple40Touch : baseColors.purple40,
    purple35: isTouchscreen ? baseColors.purple35Touch : baseColors.purple35,
    purple30: isTouchscreen ? baseColors.purple30Touch : baseColors.purple30,
    purple20: isTouchscreen ? baseColors.purple20Touch : baseColors.purple20,
    
    // Blues
    blue60: baseColors.blue60,
    blue40: baseColors.blue40,
    blue35: baseColors.blue35,
    blue30: baseColors.blue30,
    blue20: baseColors.blue20,
    blue10: baseColors.blue10,

    // Greys
    grey60: baseColors.grey60,
    grey55: baseColors.grey55,
    grey50: baseColors.grey50,
    grey40: baseColors.grey40,
    grey35: baseColors.grey35,
    grey30: baseColors.grey30,
    grey20: baseColors.grey20,
    grey10: baseColors.grey10,

    // Core
    black90: baseColors.black90,
    black80: baseColors.black80,
    black70: baseColors.black70,
    white: baseColors.white,

    // Transparent helpers
    transparent: baseColors.transparent,
    transparentWhite80: `${baseColors.white}CC`,
    transparentWhite50: `${baseColors.white}80`,
    transparentBlack80: `${baseColors.black90}80`, // Re-defined from original for clarity
  },
}

export const darkTheme: OpentronsTheme = {
  name: 'dark',
  isTouchscreen: isTouchscreen, // Set based on the imported value
  colors: {
    // Core UI
    primary: '#00A0FF', // Lighter blue for dark mode
    primaryDisabled: baseColors.blue60, // Darker, less saturated blue
    secondary: baseColors.grey40, // Lighter grey for dark mode
    accent: isTouchscreen ? '#2EEA7A' : '#1FDF8F', // Lighter green, ensure touch variant defined

    // Backgrounds
    background: baseColors.black90, // Dark background
    backgroundHover: baseColors.black80,
    surface: '#2A3B4D', // Slightly lighter dark surface (example: black80 or a custom one)
    surfaceHover: '#3F5061', // (example: black70 or a custom one)
    surfaceSubdued: baseColors.black80,
    surfaceElevated: '#344557', // (example: a step above surface)

    // Text
    text: baseColors.grey10, // Light text
    textSecondary: baseColors.grey40, // Darker secondary text (still light)
    textDisabled: baseColors.grey60, // Darker disabled text
    textOnPrimary: baseColors.white, // Usually white or very light grey for primary buttons
    textOnDark: baseColors.white, // Retained for consistency
    textLink: '#00A0FF', // Same as primary for dark mode

    // Borders
    border: baseColors.grey60, // Darker border, but visible on dark surfaces
    borderFocus: '#00A0FF', // Primary color for focus
    borderSeparator: baseColors.grey70, // Slightly more visible separator

    // Status & Feedback
    success: isTouchscreen ? '#2EEA7A' : '#1FDF8F', // Adjusted success (lighter green)
    successText: baseColors.black90, // Dark text on light green
    warning: '#FFC107', // Adjusted warning (standard yellow, usually visible)
    warningText: baseColors.black90, // Dark text on yellow
    error: '#F44336', // Adjusted error (standard red, usually visible)
    errorText: baseColors.white, // Light text on red
    info: '#00A0FF', // Adjusted info (primary color)
    infoText: baseColors.white, // Light text on info blue

    // UI Elements
    inputBackground: '#2A3B4D', // Dark input background
    inputBorder: baseColors.grey60, // Border for input
    inputText: baseColors.grey10, // Light text in input
    inputPlaceholder: baseColors.grey50,
    buttonDisabledBackground: baseColors.grey70, // Darker disabled button
    buttonDisabledText: baseColors.grey50,

    // Opentrons Specific
    deckSlot: baseColors.grey70, // Darker deck slot
    moduleBackground: '#2A3B4D', // Dark module background
    moduleBorder: baseColors.grey60,
    wellBackground: baseColors.grey50, // Darker well
    wellBorder: baseColors.grey60,
    transparentOverlay: `${baseColors.black90}CC`, // Darker overlay, more opaque

    // Icons & Glyphs
    icon: baseColors.grey30, // Lighter icons for dark mode
    iconDisabled: baseColors.grey60,
    iconHover: baseColors.grey20,
    iconActive: '#00A0FF', // Primary color for active icon

    // Interactive Elements
    interactivePrimary: '#00A0FF',
    interactivePrimaryHover: '#33B2FF', // Lighter shade of primary
    interactiveSecondary: baseColors.grey40,
    interactiveSecondaryHover: baseColors.grey30,

    // Deprecated/Direct Mappings - these should ideally be themed or removed
    // For now, providing dark theme equivalents or using light theme values if no dark equivalent makes sense
    deprecatedBlue55: '#007ACC', // A darker shade of blue than primary
    deprecatedFlex40: '#8ACDFB', // Lighter version of flex40
    deprecatedFlex55: '#027FB3', // Darker version of flex55
    deprecatedFlex50: '#00A9E0', // Lighter version of flex50

    // Greens (inverted brightness for dark mode or use accent)
    green60: isTouchscreen ? baseColors.green35Touch : baseColors.green35, // Lighter greens
    green50: isTouchscreen ? baseColors.green40Touch : baseColors.green40,
    green40: isTouchscreen ? baseColors.green50Touch : baseColors.green50,
    green35: isTouchscreen ? baseColors.green60Touch : baseColors.green60, // Darker (closer to original light's accent)
    green30: baseColors.green60, // Darkest green
    green20: baseColors.purple20, // Placeholder, review if green20 is used semantically

    // Reds (adjust for dark mode, typically keep saturation)
    red60: baseColors.red40, // Lighter reds
    red55: baseColors.red35,
    red50: baseColors.red30,
    red40: baseColors.red50,
    red35: baseColors.red55,
    red30: baseColors.red60, // Darkest red
    red20: baseColors.red20, // Often okay as is or slightly lighter

    // Yellows (adjust for dark mode)
    yellow60: baseColors.yellow30, // Lighter yellows
    yellow50: baseColors.yellow35,
    yellow40: baseColors.yellow50,
    yellow35: baseColors.yellow60, // Darker yellow
    yellow30: baseColors.yellow60, 
    yellow20: baseColors.yellow20, // Often okay as is

    // Purples (inverted or adjusted for dark mode)
    purple60: isTouchscreen ? baseColors.purple30Touch : baseColors.purple30, // Lighter purples
    purple55: isTouchscreen ? baseColors.purple35Touch : baseColors.purple35,
    purple50: isTouchscreen ? baseColors.purple40Touch : baseColors.purple40,
    purple40: isTouchscreen ? baseColors.purple50Touch : baseColors.purple50,
    purple35: isTouchscreen ? baseColors.purple55Touch : baseColors.purple55,
    purple30: isTouchscreen ? baseColors.purple60Touch : baseColors.purple60, // Darker purple
    purple20: isTouchscreen ? baseColors.purple20Touch : baseColors.purple20, // Often okay as is (lightest)

    // Blues (primary is #00A0FF)
    blue60: baseColors.blue30, // Lighter blues
    blue40: baseColors.blue50core, // Use original light primary as a lighter blue
    blue35: baseColors.blue55,
    blue30: baseColors.blue60, // Darkest blue (aside from primaryDisabled)
    blue20: baseColors.blue20, // Lightest, often okay
    blue10: baseColors.blue10, // Lightest, often okay

    // Greys (inverted scale for dark mode)
    grey60: baseColors.grey20, // Lightest grey
    grey55: baseColors.grey30,
    grey50: baseColors.grey35,
    grey40: baseColors.grey40, // Mid-grey, can be same
    grey35: baseColors.grey50,
    grey30: baseColors.grey55,
    grey20: baseColors.grey60, // Darkest grey (aside from text/bg)
    grey10: baseColors.grey60, // Darkest grey

    // Core
    black90: baseColors.grey10, // Becomes lightest for text
    black80: baseColors.grey20,
    black70: baseColors.grey30,
    white: baseColors.black90, // Becomes darkest for bg

    // Transparent helpers
    transparent: baseColors.transparent,
    transparentWhite80: `${baseColors.black90}CC`, // dark background with opacity
    transparentWhite50: `${baseColors.black90}80`,
    transparentBlack80: `${baseColors.white}CC`, // light text/element with opacity
  },
}

// It's also useful to export a type for component props that need the theme
export interface ThemeProps {
  theme: OpentronsTheme
}

// Opacity hex codes (can be moved or kept if still useful globally)
export const opacity20HexCode = '33'
export const opacity40HexCode = '66'
export const opacity60HexCode = '99'
export const opacity90HexCode = 'E6'
// The old individual color exports are now removed as per Option A.
// Components should be updated to use the theme object:
// import { useTheme } from 'styled-components'
// const MyComponent = () => {
//   const theme = useTheme()
//   return <div style={{ color: theme.colors.primary }} />
// }
// Or for class components or outside of components:
// import { lightTheme } from './colors' // or darkTheme
// console.log(lightTheme.colors.primary)
