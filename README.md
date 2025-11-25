# New Spin App

New Spin is a web app that helps you explore new music releases in an organized way. It loads release data from a JSON file, groups albums by artist, and highlights whether artists or albums are already in your library. You can quickly expand/collapse artist sections, see release counts, and distinguish new releases from reissues. Similar artists are highlighted, and a built-in Help guide explains how to update and use the app.

- [New Spin App](#new-spin-app)
  - [Features](#features)
  - [Getting Started](#getting-started)
  - [Project Structure](#project-structure)
  - [License](#license)
  - [How to Update the Release List](#how-to-update-the-release-list)
  - [Future Enhancements](#future-enhancements)
  - [AI Prompt](#ai-prompt)

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

## AI Prompt

```text
Act as a senior full-stack engineer specializing in Next.js, React, and Python backend architecture. Use the following specification as the complete context for the application I am building:

You are assisting with my personal music-library application.
This prompt contains the full context needed for future enhancements.
Everything in this block is literal text — no part of it is interpreted as Markdown.

--------------------------------------------------------------------
APPLICATION OVERVIEW
--------------------------------------------------------------------
The app aggregates weekly new releases and compares them against my personal music library.

For each new release, the backend:
• Normalizes artist/album names.
• Checks whether the artist is already in my library.
• If not in library, fetches similar albums from AllMusic’s similarAjax endpoint.
• Stores all AJAX results in a local cache.
• Computes a recommendation score:
      (# of similar albums that are already in my library)
      ----------------------------------------------------
      (total similar albums returned by AllMusic)

• Filters the similar albums list so that ONLY albums I own are included.
• Outputs everything into final_releases.json, which the UI consumes.

--------------------------------------------------------------------
DATA FILES
--------------------------------------------------------------------
new_releases.json       – weekly new releases
library_albums.json     – albums in my personal collection
similar_albums_cache/   – cached AllMusic AJAX calls
final_releases.json     – final merged dataset with all metadata included

Each entry in final_releases.json contains:
• artist
• album
• label
• genre
• release_type
• artist_in_library
• album_in_library
• similar_artist            (simple substring match)
• similar_albums           (only my owned ones remain)
• recommendation_score     (0.0 – 1.0)

--------------------------------------------------------------------
UI REQUIREMENTS
--------------------------------------------------------------------
When a release has similar albums in my collection:
• Show a “Recommended” indicator with the percentage (e.g., 85%).
• Show a toggle to expand/collapse similar albums.
• Show the similar albums as a simple artist/album list.
• DO NOT show anything if the filtered list is empty.
• The recommendation indicator must appear in the same row as the release.

--------------------------------------------------------------------
HOW THE BACKEND WORKS (NO CODE INCLUDED)
--------------------------------------------------------------------
1. Load new releases.
2. Load the library.
3. Normalize everything.
4. Determine artist_in_library and album_in_library.
5. If artist not in library:
      - Load cached similar albums or fetch remotely.
      - Normalize results.
      - Compute recommendation_score.
      - Filter similar albums to only the ones in my library.
6. Save output to final_releases.json.

--------------------------------------------------------------------
HOW TO BEHAVE IN FUTURE CHATS
--------------------------------------------------------------------
• Treat this as the official specification of the app.
• When asked for code, provide clean, concise, well-commented snippets.
• Assume future tasks may modify UI, backend logic, data structure, or features.
```
