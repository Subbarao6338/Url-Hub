/**
 * Nature Toolbox - Theme Tokens & Constants
 * Defines the palette and common visual/logical constants.
 */
export const NATURE_THEME = {
  palette: {
    bg: "#FAFAF7",
    primary: "#2D6A4F",      // Fern Green
    moss: "#52B788",         // Moss
    mist: "#B7E4C7",         // Morning Mist
    sunlight: "#F4A261",     // Sunlight Gold
    earth: "#6B4226",        // Earth Brown
    white: "#FFFFFF"
  },
  typography: {
    title: "Outfit",
    body: "DM Sans"
  },
  thermalLevels: {
    0: { label: "nominal", color: "#52B788" },
    1: { label: "fair", color: "#F4A261" },
    2: { label: "serious", color: "#E76F51" },
    3: { label: "critical", color: "#BA1A1A" },
    4: { label: "emergency", color: "#690005" },
    5: { label: "shutdown", color: "#000000" }
  }
};

export const SENSOR_POLLING_MS = 200;
export const MAX_GRAPH_POINTS = 50;
