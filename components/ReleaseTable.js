'use client';
import React, { useEffect, useState } from 'react';

import WatchlistForm from './WatchlistForm';

export default function ReleaseTable() {
  const [releases, setReleases] = useState([]);
  const [expandedSimilar, setExpandedSimilar] = useState({});
  const [favorites, setFavorites] = useState({});
  const [showHelp, setShowHelp] = useState(false);
  const [releaseWeek, setReleaseWeek] = useState(null);
  const [watchlist, setWatchlist] = useState([]);
  const [editItem, setEditItem] = useState(null);

  // --- NEW STATE FOR RECOMMENDED TABLE SORT ---
  // Key options: 'artist' (default) or 'matchCount'
  const [recommendedSortKey, setRecommendedSortKey] = useState('artist');

  const fetchWatchlist = () => {
    fetch('/watchlist.json')
      .then((res) => res.json())
      .then((data) => setWatchlist(data || []))
      .catch((err) => console.error('Error loading watchlist:', err));
  };

  useEffect(() => {
    fetch('/final_releases.json')
      .then((res) => res.json())
      .then((data) => {
        setReleaseWeek(data.release_week || null);
        setReleases(data.items || []);
      })
      .catch((err) => console.error('Error loading releases:', err));

    fetchWatchlist();

    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  const toggleSimilar = (key) => {
    setExpandedSimilar((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleFavorite = (artist, album) => {
    const key = `${artist}::${album}`;
    const newFavorites = { ...favorites, [key]: !favorites[key] };
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  // Delete Watchlist entry
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this album?')) return;

    try {
      const res = await fetch(`/api/watchlist?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchWatchlist(); // Refresh the list after deleting
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const getRowBg = (isFavorite, index) => {
    if (isFavorite) return 'bg-blue-500/30';
    return index % 2 === 0
      ? 'bg-zinc-900 hover:bg-red-900/30'
      : 'bg-zinc-950 hover:bg-red-900/30';
  };

  const visibleReleases = releases;

  const favoriteKeys = new Set(
    Object.entries(favorites)
      .filter(([_, v]) => v)
      .map(([k]) => k),
  );

  const favoriteReleases = visibleReleases.filter((r) =>
    favoriteKeys.has(`${r.artist}::${r.album}`),
  );

  const priorityReleases = visibleReleases.filter(
    (r) =>
      r.artist_in_library &&
      !r.album_in_library &&
      !favoriteKeys.has(`${r.artist}::${r.album}`),
  );

  const mainReleasesList = visibleReleases.filter(
    (r) =>
      !favoriteKeys.has(`${r.artist}::${r.album}`) &&
      !(r.artist_in_library && !r.album_in_library),
  );

  // NEW FILTERING FOR RECOMMENDED TABLE
  const recommendedReleases = mainReleasesList.filter(
    (r) => (r.similar_albums || []).length > 0,
  );

  const nonRecommendedMainList = mainReleasesList.filter(
    (r) => (r.similar_albums || []).length === 0,
  );

  const groupByArtist = (items) =>
    items.reduce((acc, release) => {
      const artist = release.artist;
      if (!acc[artist]) acc[artist] = [];
      acc[artist].push(release);
      return acc;
    }, {});

  const groupedPriority = groupByArtist(priorityReleases);
  const groupedRecommended = groupByArtist(recommendedReleases);
  const groupedMain = groupByArtist(nonRecommendedMainList);

  const totalArtists = new Set(visibleReleases.map((r) => r.artist)).size;
  const totalAlbums = visibleReleases.length;
  const newCount = visibleReleases.filter(
    (r) => r.release_type === 'new',
  ).length;
  const reissueCount = visibleReleases.filter(
    (r) => r.release_type === 'reissue',
  ).length;

  // --- NEW SORTING FUNCTION FOR RECOMMENDED GROUPS ---
  const sortRecommendedGroups = (groups, sortKey) => {
    if (sortKey === 'artist') {
      // Sort by artist name (A-Z) - default behavior
      return groups.sort((a, b) => a[0].artist.localeCompare(b[0].artist));
    }

    // Sort by match count (Highest to Lowest)
    return groups.sort((a, b) => {
      // 'a' and 'b' are arrays of releases for a single artist.
      // Get the highest match count for the artist group.
      const maxMatchesA = Math.max(
        ...a.map((r) => (r.similar_albums || []).length),
      );
      const maxMatchesB = Math.max(
        ...b.map((r) => (r.similar_albums || []).length),
      );

      // Sort descending (b - a)
      return maxMatchesB - maxMatchesA;
    });
  };
  // -----------------------------------------------------

  const renderSimilarSection = (release) => {
    const similar = release.similar_albums || [];
    if (similar.length === 0) return null;

    const key = `${release.artist}::${release.album}`;
    const score = release.recommendation_score || 0;

    // UPDATED MATCH-COUNT LOGIC
    const matchCount = similar.length;
    let matchLabel = 'Recommended';

    if (matchCount >= 10) {
      matchLabel = 'Strong Match';
    } else if (matchCount >= 5) {
      matchLabel = 'Mild Match';
    } else {
      // Under 5 matches
      matchLabel = 'Weak Match';
    }
    // END MATCH-COUNT LOGIC

    const percent = Math.round(score * 100);

    const stars = '★★★★★';
    const filled = Math.round((percent / 100) * 5);

    return (
      <div className="mt-1 ml-2 text-sm text-yellow-300">
        <div>
          {matchLabel}{' '}
          <span className="text-yellow-400">
            {stars.slice(0, filled)}
            <span className="text-zinc-600">{stars.slice(filled)}</span>
          </span>{' '}
          ({percent}%)
        </div>

        <div
          onClick={() => toggleSimilar(key)}
          className="cursor-pointer text-yellow-400 hover:text-yellow-200 ml-4"
        >
          ↳ View similar albums ({similar.length} match
          {similar.length !== 1 ? 'es' : ''})
        </div>

        {expandedSimilar[key] && (
          <ul className="ml-8 mt-1 text-zinc-300 list-disc">
            {/* FIX: Sorted similar albums by artist */}
            {[...similar]
              .sort((a, b) => a.artist.localeCompare(b.artist))
              .map((a, idx) => (
                <li key={idx}>
                  {a.artist} – {a.album}
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  };

  const renderReleaseRow = (release, rowIndex) => {
    const albumStyle = release.album_in_library
      ? 'text-red-500'
      : 'text-zinc-400';
    const key = `${release.artist}::${release.album}`;
    const isFavorite = favorites[key];

    return (
      <tr
        key={key}
        className={`${getRowBg(
          isFavorite,
          rowIndex,
        )} border-t border-zinc-700/50 align-top`}
      >
        <td
          className={`px-6 py-4 font-medium ${
            release.artist_in_library
              ? 'text-zinc-300'
              : release.similar_artist
                ? 'text-yellow-400'
                : 'text-zinc-300'
          }`}
        >
          <div>{release.artist}</div>
          {renderSimilarSection(release)}
        </td>

        <td className={`px-6 py-4 ${albumStyle}`}>{release.album}</td>
        <td className="px-6 py-4 text-zinc-400">{release.label}</td>
        <td className="px-6 py-4 text-zinc-400">{release.genre}</td>
        <td className="px-6 py-4">
          {release.release_type === 'new' ? (
            <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {release.release_type}
            </span>
          ) : (
            <span className="text-zinc-400">{release.release_type}</span>
          )}
        </td>
        <td className="px-6 py-4">
          <input
            type="checkbox"
            checked={favorites[key] || false}
            onChange={() => toggleFavorite(release.artist, release.album)}
          />
        </td>
      </tr>
    );
  };

  // Define the table configurations
  const tableConfigs = [
    ['⭐ Marked Releases', favoriteReleases, true, false, false], // Title, List, isFavoriteSection, isGrouped, isSortable
    [
      '🎵 Releases from my artists',
      Object.values(groupedPriority),
      false,
      true,
      false,
    ],
    // --- RECOMMENDED TABLE CONFIGURATION ---
    [
      '✨ Recommended Releases',
      Object.values(groupedRecommended),
      false,
      true,
      true, // isSortable is TRUE
    ],
    // ---------------------------------------
    [
      '📀 All Other Releases',
      nonRecommendedMainList, // Using the non-grouped list
      false,
      false,
      false,
    ],
  ];

  return (
    <div
      id="top"
      className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-red-600 drop-shadow-[0_0_6px_rgba(139,0,0,0.5)]">
              New Spin
            </h1>

            {releaseWeek && (
              <div className="text-sm text-zinc-400 mt-1">{releaseWeek}</div>
            )}
          </div>

          <button
            onClick={() => setShowHelp(true)}
            className="text-sm text-zinc-300 hover:text-red-500 underline"
          >
            Help
          </button>
        </div>

        {/* Summary */}

        <div className="mb-4 text-zinc-300 text-sm">
          {totalArtists} artists, {totalAlbums} albums ({newCount} new,{' '}
          {reissueCount} reissue)
        </div>

        {/* Tables */}
        {/* Watchlist Section */}
        <WatchlistForm
          onRefresh={fetchWatchlist}
          editItem={editItem}
          setEditItem={setEditItem}
        />

        {watchlist.length > 0 && (
          <div className="mb-8 overflow-x-auto rounded-xl shadow-lg ring-1 ring-zinc-700/50 bg-zinc-900/20">
            <h2 className="text-lg font-semibold mb-2 p-2 flex items-center gap-2 text-blue-400">
              <span>📅 My Watchlist</span>
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-zinc-800 text-left text-sm uppercase tracking-wider text-blue-500">
                  <th className="px-6 py-4">Artist</th>
                  <th className="px-6 py-4">Album</th>
                  <th className="px-6 py-4">Notable Song</th>
                  <th className="px-6 py-4">Expected Release</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="border-t border-zinc-700/50 bg-zinc-900/40 hover:bg-zinc-800/50"
                  >
                    <td className="px-6 py-4 font-medium text-zinc-300">
                      {item.artist}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 italic">
                      {item.album}
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-sm">
                      {item.song || '—'}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-sm">
                      {item.date ? (
                        // We append "T00:00:00" to force the browser to stay in YOUR timezone
                        new Date(item.date + 'T00:00:00').toLocaleDateString(
                          undefined,
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          },
                        )
                      ) : (
                        <span className="text-zinc-600 italic">TBD</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setEditItem(item)}
                        className="text-zinc-500 hover:text-blue-400 transition-colors p-2"
                        title="Edit entry"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-zinc-500 hover:text-red-500 transition-colors p-2"
                        title="Remove from watchlist"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tableConfigs.map(
          (
            [title, list, isFavoriteSection, isGrouped, isSortable],
            tableIdx,
          ) => {
            if (list.length === 0) return null;

            // --- Apply Sorting to Recommended Table Data ---
            let sortedList = list;
            if (isSortable) {
              // Only runs for the Recommended Releases table
              sortedList = sortRecommendedGroups([...list], recommendedSortKey);
            }
            // ------------------------------------------------

            return (
              <div
                key={tableIdx}
                className="mb-8 overflow-x-auto rounded-xl shadow-lg ring-1 ring-zinc-700/50"
              >
                <h2
                  className={`text-lg font-semibold mb-2 flex items-center gap-2 ${
                    isFavoriteSection
                      ? 'text-red-400'
                      : title.includes('Recommended')
                        ? 'text-yellow-400'
                        : title.includes('artists')
                          ? 'text-yellow-400'
                          : 'text-zinc-300'
                  }`}
                >
                  <span>{title}</span>

                  {/* --- SORTING CONTROL FOR RECOMMENDED TABLE --- */}
                  {isSortable && (
                    <div className="text-sm font-normal ml-4 text-zinc-400">
                      Sort by:
                      <button
                        onClick={() => setRecommendedSortKey('artist')}
                        className={`ml-2 px-2 py-0.5 rounded ${
                          recommendedSortKey === 'artist'
                            ? 'bg-zinc-700 text-yellow-300'
                            : 'hover:text-yellow-400'
                        }`}
                      >
                        Artist
                      </button>
                      <button
                        onClick={() => setRecommendedSortKey('matchCount')}
                        className={`ml-2 px-2 py-0.5 rounded ${
                          recommendedSortKey === 'matchCount'
                            ? 'bg-zinc-700 text-yellow-300'
                            : 'hover:text-yellow-400'
                        }`}
                      >
                        Matches
                      </button>
                    </div>
                  )}
                  {/* ----------------------------------------------- */}
                </h2>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-zinc-800 text-left text-sm uppercase tracking-wider text-red-500">
                      <th className="px-6 py-4">Artist</th>
                      <th className="px-6 py-4">Album</th>
                      <th className="px-6 py-4">Label</th>
                      <th className="px-6 py-4">Genre</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Favorite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isGrouped
                      ? sortedList.map((artistReleases, artistIdx) => (
                          <React.Fragment key={artistIdx}>
                            {artistReleases.map((release, releaseIdx) => (
                              <React.Fragment key={releaseIdx}>
                                {/* Calculate index for correct row banding */}
                                {renderReleaseRow(
                                  release,
                                  artistIdx * artistReleases.length +
                                    releaseIdx,
                                )}
                              </React.Fragment>
                            ))}
                          </React.Fragment>
                        ))
                      : sortedList.map((release, idx) => (
                          <React.Fragment key={idx}>
                            {renderReleaseRow(release, idx)}
                          </React.Fragment>
                        ))}
                  </tbody>
                </table>
              </div>
            );
          },
        )}

        {/* Back to Top and Help Modal (Unchanged) */}
        <div className="mt-10 text-center">
          <a
            href="#top"
            className="text-sm text-zinc-400 hover:text-red-500 underline"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Back to Top ▲
          </a>
        </div>
      </div>

      {showHelp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-zinc-900 rounded-xl shadow-xl max-w-lg w-full p-6 relative">
            <button
              onClick={() => setShowHelp(false)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-red-500"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-red-500">How to Use</h2>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li>• Red = in your library, Yellow = similar artist.</li>
              <li>
                • Click “View similar albums” to expand additional matches.
              </li>
              <li>• New = red badge, Reissue = gray label.</li>
              <li>
                • Data comes from <code>final_releases.json</code>. Replace this
                file to update.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
