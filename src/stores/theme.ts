import { writable } from 'svelte/store';

// Define the type for a single color
interface ColorFormat {
  hex: number;
  hexString: string;
  rgb: string;
  rgba: (alpha: number) => string;
  r: number;
  g: number;
  b: number;
}

// Define the type for the color palette
interface ColorPalette {
  background: ColorFormat;
  text: ColorFormat;
  accent: ColorFormat;
  secondary: ColorFormat;
  [key: string]: ColorFormat;
}

// Function to create properly typed color palette
export const createColorPalette = (): ColorPalette => {
  // Define base colors
  const PALETTE = {
    background: 0xF4F7FB,  // Light blue for a bright sky (60%)
    text: 0x2C2828,        // Deep matte charcoal (30%)
    accent: 0x187B43,      // Deep green — brand accent
    accent_two: 0x187B43,  // Deep green for text
    secondary: 0x2C2828,   // Light slate for a more reflective feel
  };

  // Convert to various formats
  const colors: Partial<ColorPalette> = {};
  
  // Iterate through each color in the palette
  Object.entries(PALETTE).forEach(([key, hexValue]) => {
    // Convert to hex string format
    const hexString = '#' + hexValue.toString(16).padStart(6, '0');
    
    // Convert to RGB format
    const r = (hexValue >> 16) & 255;
    const g = (hexValue >> 8) & 255;
    const b = hexValue & 255;
    
    colors[key] = {
      hex: hexValue,          // For Three.js (numeric format)
      hexString,              // For CSS (#RRGGBB)
      rgb: `rgb(${r}, ${g}, ${b})`,  // For CSS rgb()
      rgba: (alpha) => `rgba(${r}, ${g}, ${b}, ${alpha})`, // Function for rgba
      r, g, b                 // Individual RGB components
    };
  });
  
  return colors as ColorPalette;
};

// Define the type for our theme
interface Theme {
  colors: ColorPalette;
}

// Create a writable store with the color palette
export const theme = writable<Theme>({
  colors: createColorPalette(),
});