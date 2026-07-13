# Epic Toolbox

Your all-in-one workspace for essential tools and productivity. Epic Toolbox brings together everything you need to handle documents, web tasks, development utilities, and daily productivity in one beautiful, easy-to-use application.

## 🌟 Key Features

### 📚 Bookmarks Manager
Organize your favorite links and resources efficiently.
- **Categorization**: Group your links by topics for easy access.
- **Pinning**: Keep your most important bookmarks at the top.
- **Search**: Quickly find any link with a powerful search bar.
- **Multi-URL Support**: Handle bookmarks that contain multiple related links.
- **Privacy Profiles**: Manage different sets of bookmarks for different needs.

### 🛠️ Specialized Toolsets
- **Document Tools**: Edit, convert, and translate documents (PDF, Image, Text) directly in your browser. Features a powerful online translator powered by Google Translate, with an improved offline fallback for Telugu.
- **Web & Social**: Download media from social platforms and archive web content easily. Includes optimized URL to PDF and web archiving tools.
- **Productivity**: Use built-in world clocks, Pomodoro timers, and stopwatches to manage your time.
- **Data & Math**: Perform statistical analysis, generate mock data, and use various calculators. Enhanced multivariate anomaly detection and data quality audits.
- **Developer Utilities**: Advanced SQL and KQL formatters, JSON to TypeScript interface generator (now supporting nested objects), and a comprehensive Code Inspiration hub.
- **AI Assistants**: Access chat assistants, image generation tools, and local sentiment analysis.

### 🎨 Personalization & Experience
- **Modern Interface**: Enjoy a clean, intuitive design inspired by Material Design.
- **Themes**: Switch between Light, Dark, or System modes to suit your preference.
- **Offline Ready**: Access many of your tools even without an internet connection.
- **Privacy Focused**: Your data stays with you—sensitive processing is done locally on your device whenever possible.

## 📖 How to Use

### Navigating the App
Use the navigation bar at the bottom (or side on desktop) to switch between the main sections:
1. **Bookmarks**: Your personal library of saved links.
2. **Toolbox**: The central hub for all utility tools.
3. **Projects**: Manage your ongoing work and tasks.
4. **Settings**: Customize the application to your liking.

### Using the Toolbox
1. Click on a category (e.g., "Document Tools") to see available utilities.
2. Select a tool to open it.
3. Most tools allow you to drag and drop files or paste text for instant processing.

### Managing Bookmarks
- **Adding**: Click the "Add" button in settings or the bookmark view to save a new link.
- **Editing**: Long-press (on mobile) or click the menu icon on a bookmark card to edit its details.
- **Opening**: Simply click a card to open the link. If it has multiple URLs, a menu will appear.

## 🚀 Recent Improvements & Bug Fixes

- **Developer Hub**:
    - **Enhanced SQL Formatter**: Re-engineered with robust subquery detection and improved parentheses depth tracking to handle complex nested queries correctly. Optimized performance by moving static keyword configurations outside the core formatting logic.
    - **Refined KQL Formatter**: Standardized function casing and improved multi-line alignment for pipe segments with smarter comma-splitting.
    - **Improved JSON to TypeScript**: Optimized interface generator with unique interface naming and support for deeply nested objects. Fixed a critical regex typo in interface name sanitization.
- **Media & Web**:
    - **Upgraded Image Processing**: Replaced static filters with real-time range sliders for Brightness, Contrast, and Saturation using the Canvas API. Added a new "Reset" feature for quick adjustments.
    - **Integrated SponsorBlock**: Support in Social Downloader for identifying sponsor segments.
    - **AI Video Summarization**: Integrated into Social Downloader (requires Gemini API).
- **Analytics & Math**:
    - **Advanced Text Analytics**: Implemented **Flesch Reading Ease** and **Flesch-Kincaid Grade Level** algorithms. Added a "Copy to Clipboard" feature for analysis results.
    - **Expanded Unit Converter**: Added new categories for **Data Transfer Rate** (bps to Tbps) and **Angle** (Degrees, Radians, Gradians).
    - **Optimized Data Science Hub**: Re-engineered core analytics with single-pass loops for statistics calculation, significantly reducing computational overhead for large datasets.
- **AI & Local Tools**:
    - Expanded **Local Sentiment Analysis** dictionary and improved negation handling.
    - Standardized test environment with **Vitest** and **Playwright**.
    - Fixed Notion Integration validation bug.

### Latest Updates:
- **Performance Optimization**: Deeply optimized `runDataQualitySuite` and `detectMultivariateAnomalies` using single-pass traversals and consolidated mathematical operations.
- **UX Refinement**: Added "Clear" buttons to all primary tools (JsonToTs, SocialDownloader, JsonCsvConverter) to standardize the user experience.
- **Bug Fixes**:
    - Fixed a regex typo in **JSON to TypeScript** interface generator.
    - Added comprehensive error reporting for **JSON ↔ CSV Converter**.
    - Optimized memory usage in **SQL Formatter** and **Data Science Hub**.
- **Image Privacy & Edit Lab**: Now supports simultaneous multi-filter adjustments including Brightness, Contrast, Saturation, Hue, and Blur.
- **SQL Formatter**: Added support for spatial and window functions, with refined indentation for complex subqueries.
- **Offline Translator**: Significantly expanded the English-to-Telugu dictionary with 30+ new common phrases and greetings.
- **Unit Converter**: Introduced new categories for **Frequency** and **Fuel Consumption** with specialized non-linear conversion logic.
- **Markdown Editor**: Added a new interactive toolbar for rapid formatting (Bold, Italic, Lists, Links, etc.).
- **Data Science Hub**: Improved stability of multivariate anomaly detection and expanded the Data Quality Suite with more comprehensive audits.

---
*Epic Toolbox is built to simplify your digital life. Start exploring and boost your productivity today!*
