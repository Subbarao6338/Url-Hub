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
    travel: {
        worldClock: "World Clock",
        timezoneConv: "Timezone Converter",
        packingList: "Packing List",
        addItem: "Add travel item..."
    },
    finance: {
        vat: "VAT Calculator",
        inflation: "Inflation",
        loan: "Loan Calculator",
        compound: "Compound Interest",
        cagr: "CAGR",
        dcf: "DCF (NPV)"
    },
    security: {
        rsa: "RSA Key Generation",
        hmac: "HMAC Signer",
        privacyAuditor: "Privacy Auditor",
        strengthMeter: "Password Strength"
    },
    audio: {
        frequency: "Frequency Generator",
        metronome: "Metronome",
        tuner: "Instrument Tuner"
    },
    devops: {
        jwt: "JWT Decoder",
        cron: "Cron Generator",
        sql: "SQL Formatter",
        http: "HTTP Client",
        regex: "Regex Tester"
    }
  }
};
