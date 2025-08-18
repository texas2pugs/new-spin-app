# New Spin App

New Spin is a web app that helps you explore new music releases in an organized way. It loads release data from a JSON file, groups albums by artist, and highlights whether artists or albums are already in your library. You can quickly expand/collapse artist sections, see release counts, and distinguish new releases from reissues. Similar artists are highlighted, and a built-in Help guide explains how to update and use the app.

- [New Spin App](#new-spin-app)
  - [Features](#features)
  - [Getting Started](#getting-started)
  - [Project Structure](#project-structure)
  - [License](#license)
  - [How to Update the Release List](#how-to-update-the-release-list)
  - [Future Enhancements](#future-enhancements)

## Features

- Grouped by Artist – Expand or collapse each artist to view their albums.
- Release Counts – See total artists, albums, and breakdown of new vs. reissue.
- Visual Highlights – Artists/albums in your library show in red; similar artists in yellow.
- Album Details – View label, genre, and release type (with badges for new releases).
- Expand/Collapse All – Quickly toggle all artist groups open or closed.
- Built-in Help – Access usage instructions and details on updating the release list.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

1. Start the development server:

   ```bash
   npm run dev
   ```

1. Open browser and visit:

   ```text
   http://localhost:3000
   ```

## Project Structure

- `components/ReleaseTable.js` - main UI component that renders the release list
- `public/final-releases.json` - the dataset of releases (artists, albums, etc.)
- `README.md` - documentation for the project

## License

This project is provided for personal use. You may modify and adapt it to your own needs.

## How to Update the Release List

1. From Apple Music, export the music library to Library.xml
1. Convert the XML to JSON

   ```sh
   python3 convert_library.py
   ```

1. Generate a new JSON scrape of new releases

   ```sh
   python3 scrape-releases.py
   ```

1. Merge the two JSON files to create `final_releases.json`

   ```sh
   python3 merge_lib_new.py
   ```

1. Copy to `public/`

   ```sh
   cp final_releases.json <path-to-public>/public/
   ```

## Future Enhancements

The following features are planned or under consideration for future releases:

- **Starred Releases**
  Allow users to "star" (or bookmark) new releases they want to track.

  - Could be implemented with a simple checkbox or toggle button.
  - Starred releases would be displayed in a dedicated section at the top for quick access.

- **Search and Filter**
  Add the ability to filter releases by artist, genre, or label, and quickly search within the list.

- **Export / Share**
  Support exporting the release list (or just starred releases) as CSV/JSON, or share via a link.

- **Sorting Options**
  Enable sorting releases by release type, label, or alphabetical order.

- **UI Enhancements**
  - Add dark/light mode toggle.
  - Option to collapse/expand all artists at once.
  - Improved visual cues for similar artists.

These ideas are open to iteration and may be adjusted as the project evolves.
