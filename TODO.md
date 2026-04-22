# Nature Toolbox - Forest at Dawn 🌲

The app has been transformed into a nature-driven, senior-engineered Android toolbox.

## Key Changes
- **Infrastructure:** Centralized strings in `src/strings.js` and theme tokens in `src/constants.js`.
- **Mandate Design:** Paper texture, pebble shapes, and organic leaf accents throughout the UI.
- **New Tools:**
    - `Sunlight Graph`: Ambient light monitoring with live intensity history.
    - `Thermal Health`: Visual status and temperature gauge for device thermal management.
- **Tool Upgrades:** `DeviceInfo` and `AndroidSensors` now use real APIs and nature-inspired visuals.
- **Stability:** Added robust error boundaries and rationale-based permission flows.

## Remaining Work (TODO)
- [ ] **Android Bridge:** Implement native Java/Kotlin bridge for `PowerManager.getThermalStatus()` to provide 100% accurate thermal data (currently simulated for web-demo).
- [ ] **Sensor Calibration:** Add a "Recalibrate" option in per-tool settings for Compass and Light sensor.
- [ ] **Perf Audit:** Monitor large-list performance when `groupToolbox` is disabled with 150+ tools.

## Verification
Verification was conducted via Playwright for visual consistency. New tools were confirmed to load and render with the nature palette.
