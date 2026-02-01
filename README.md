# URL Hub

![URL Hub Screenshot](./urlhub.png)

A personal, offline-first dashboard to organize and access your favorite tools, websites, and resources.

## Features

- **Categorized View**: Links are automatically grouped by categories (e.g., specific categories defined in `links.json`).
- **Search**: Real-time filtering by title or URL.
- **Local Storage**: Your changes (adding, editing, deleting links) are saved locally in your browser, so they persist across sessions.
- **Dark/Light Mode**: Toggle between themes based on your preference.
- **Responsive Design**: Works on desktop and mobile devices with a collapsible sidebar.
- **Import/Export**: Backup your links to a JSON file and restore them later.
- **Privacy Focused**: No external tracking; everything runs locally.

## Getting Started

1. **Open the Dashboard**: Simply open `index.html` in your web browser.
2. **Initial Data**: The app loads initial data from `links.json`.
3. **Customize**: 
   - Click the **Add Link** button (if available in UI) or use the edit/delete buttons on cards to manage your tools.
   - Toggle the theme using the settings/theme button.

## File Structure

- `tools.html`: The main entry point for the application.
- `hub.js`: Contains all the logic for the dashboard, including state management and UI rendering.
- `style.css`: Styles for the application.
- `links.json`: The default list of links used to populate the dashboard if no local data is found.

## Customization

You can manually edit `links.json` to change the default set of links that load for a new user (or if you clear your local storage).

Mofidy the `links.json` file with the following structure:

```json
[
  {
    "title": "Example Title",
    "url": "https://example.com",
    "category": "Utilities"
  }
]
```
