# URL Hub

![URL Hub Screenshot](assets/urlhub.png)

A personal dashboard to organize and access your favorite websites.

## Features

- **Categorized View**: Links are automatically grouped by categories (e.g., specific categories defined in `links.json`).
- **Search**: Real-time filtering by title or URL.
- **Local Storage**: Your changes (adding, editing, deleting links) are saved locally in your browser, so they persist across sessions.
- **Dark/Light Mode**: Toggle between themes based on your preference.
- **Responsive Design**: Works on desktop and mobile devices.
- **Import/Export**: Backup your links to a JSON file and restore them later.
- **Privacy Focused**: No external tracking; everything runs locally.

## Getting Started

1. **Open the Dashboard**: Simply open `index.html` in your web browser.
2. **Initial Data**: The app loads initial data from `links.json`.
3. **Customize**: 
   - Click the **Add Link** button (if available in UI) or use the edit/delete buttons on cards to manage your tools.
   - Toggle the theme using the settings/theme button.

## File Structure

- `index.html`: The main entry point for the application.
- `hub.js`: Contains all the logic for the dashboard, including state management and UI rendering.
- `style.css`: Styles for the application.
- `links.json`: The default list of links used to populate the dashboard if no local data is found.

## Customization

You can manually edit `links.json` to change the default set of links that load for a new user (or if you clear your local storage).

Modify the `links.json` file with the following structure:

```json
[
  {
    "title": "Example Title",
    "url": "https://example.com",
    "optional_icon": "https://example.com/favicons/favicon.ico",
    "urls": ["https://example.com", "https://backup.example.com"],
    "category": "Utilities"
  }
]
```

## Settings Options

The application provides several customization options via the Settings modal:

### Appearance
- **Dark Mode**: Toggles between light and dark color schemes.
- **Compact View**: Switches to a denser grid layout for more links on screen.
- **Hide URLs**: Hides the display of tool URLs on the cards for a cleaner look.
- **Hide Icons**: Disables fetching and displaying favicons or emojis.
- **Solid Mode**: Disables glassmorphism and background animations for better performance.
- **Show Counts**: Toggles the visibility of link counts next to categories.
- **Aurora BG**: Toggles the animated background effect.
- **Color Palette**: Choose from various accent colors to customize the theme.

### Data Management
- **Export Backup**: Downloads your current link collection as a JSON file.
- **Import Backup**: Restores your collection from a previously exported JSON file.
- **Reset Dashboard**: Clears all local changes and restores the default set of links from `links.json`.
