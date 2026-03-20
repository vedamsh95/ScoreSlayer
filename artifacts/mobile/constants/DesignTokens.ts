/**
 * DesignTokens.ts
 * "Polymer Pop" Color System & Shadows
 */

export const COLORS = {
  background: "#1A0533",
  primary: "#00F5A0",    // Mint Pop
  secondary: "#FF2D78",  // Pink Pop
  accent: "#FFB800",     // Gold Pop
  info: "#00BFFF",       // Sky Pop
  surface: "#240B45",
  text: "#FFFFFF",
  muted: "rgba(255,255,255,0.45)",
  border: "rgba(255,255,255,0.06)",
};

export const SHADOWS = {
  // Deep neumorphic "trench"
  trench: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  // High-specular "clay" curve
  clay: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  }
};
