/**
 * Nature Toolbox - Externalized Strings
 * Consolidates all UI text for localization readiness and consistency.
 */
export const STRINGS = {
  common: {
    back: "Back",
    loading: "Nurturing tool...",
    error: "A storm has passed through. Please try again.",
    detecting: "Detecting...",
    searchPlaceholder: "Search nature's tools...",
    emptyStateTitle: "No tools found — just rustling leaves…",
    emptyStateBody: "Try searching for something else or explore different categories.",
    pinnerEmptyState: "No tools pinned yet — plant your favourites 🌱"
  },
  tools: {
    sunlight: {
      title: "Sunlight Graph",
      intensity: "Sunlight Intensity",
      history: "Intensity History",
      unit: "lux",
      low: "Shade 🌳",
      medium: "Partial Sun ⛅",
      high: "Full Sun ☀️",
      notSupported: "Light sensor not detected on this device."
    },
    thermal: {
      title: "Thermal Health",
      status: "Thermal Status",
      temperature: "Device Temperature",
      cooling: "Cooling Down ❄️",
      nominal: "Nominal 🍃",
      fair: "Fair 🌤️",
      serious: "Serious ⚠️",
      critical: "Critical 🔥",
      emergency: "Emergency 🌋",
      shutdown: "Shutdown Imminent 💀"
    },
    deviceInfo: {
      title: "Device Info",
      manufacturer: "Manufacturer",
      model: "Model",
      os: "OS Version",
      battery: "Battery",
      connection: "Connection",
      platform: "Platform",
      metrics: "Live Metrics (Est.)",
      cpu: "CPU Usage",
      ram: "Memory Usage",
      disclaimer: "System-level metrics are approximations based on available browser and Capacitor APIs."
    },
    sensors: {
      title: "Sensors",
      compass: "COMPASS",
      spiritLevel: "SPIRIT LEVEL",
      allSensors: "All Sensors",
      accX: "Acc X",
      accY: "Acc Y",
      accZ: "Acc Z",
      light: "Light"
    },
    health: {
      bmrTitle: "BMR Calculator",
      caloriesTitle: "Daily Calories",
      weight: "Weight (kg)",
      height: "Height (cm)",
      age: "Age",
      calculate: "Calculate",
      maintenance: "Maintenance Calories",
      weightLoss: "Weight Loss",
      weightGain: "Weight Gain"
    },
    security: {
      privacyAuditor: "Privacy Auditor",
      strengthMeter: "Password Strength",
      veryWeak: "Very Weak",
      weak: "Weak",
      fair: "Fair",
      good: "Good",
      strong: "Strong",
      excellent: "Excellent"
    },
    text: {
        binary: "Binary",
        hex: "Hex",
        caesar: "Caesar Cipher",
        slugify: "Slugify",
        reverse: "Reverse",
        upper: "UPPERCASE",
        lower: "lowercase",
        capitalize: "Capitalize"
    }
  }
};
