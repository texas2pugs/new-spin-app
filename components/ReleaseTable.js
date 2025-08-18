"use client";
import React, { useEffect, useState } from "react";

export default function ReleaseTable() {
  const [releases, setReleases] = useState([]);
  const [expandedArtists, setExpandedArtists] = useState({});
  const [favorites, setFavorites] = useState({});
  const [showHelp, setShowHelp] = useState(false);

  // Load releases
  useEffect(() => {
    fetch("/final_releases.json")
      .then((res) => res.json())
      .then((data) => setReleases(data))
      .catch((err) => console.error("Error loading releases:", err));
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  // Group releases by artist
  const grouped = releases.reduce((acc, release) => {
    const artist = release.artist;
    if (!acc[artist]) acc[artist] = [];
    acc[artist].push(release);
    return acc;
  }, {});

  // Compute summary
  const totalArtists = Object.keys(grouped).length;
  const totalAlbums = releases.length;
  const newCount = releases.filter((r) => r.release_type === "new").length;
  const reissueCount = releases.filter(
    (r) => r.release_type === "reissue"
  ).length;

  const toggleArtist = (artist) => {
    setExpandedArtists((prev) => ({
      ...prev,
      [artist]: !prev[artist],
    }));
  };

  const toggleFavorite = (artist, album) => {
    const key = `${artist}::${album}`;
    const updated = { ...favorites, [key]: !favorites[key] };
    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold tracking-tight text-red-600 drop-shadow-[0_0_6px_rgba(139,0,0,0.5)]">
            New Spin
          </h1>
          <button
            onClick={() => setShowHelp(true)}
            className="text-sm text-zinc-300 hover:text-red-500 underline"
          >
            Help
          </button>
        </div>

        {/* Summary */}
        <div className="mb-4 text-zinc-300 text-sm">
          {totalArtists} artists, {totalAlbums} albums ({newCount} new,{" "}
          {reissueCount} reissue)
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-zinc-700/50">
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
              {Object.entries(grouped).map(
                ([artist, artistReleases], artistIndex) => {
                  const artistInLibrary = artistReleases.some(
                    (r) => r.artist_in_library
                  );
                  const hasSimilarArtist = artistReleases.some(
                    (r) => r.similar_artist
                  );
                  const artistStyle = artistInLibrary
                    ? "text-red-500"
                    : hasSimilarArtist
                    ? "text-yellow-400"
                    : "text-zinc-300";
                  const badgeCount = artistReleases.length;

                  const singleRelease = artistReleases.length === 1;

                  return (
                    <React.Fragment key={artist}>
                      <tr
                        className={`border-t border-zinc-700/50 transition-colors group ${
                          artistIndex % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"
                        } ${
                          !singleRelease
                            ? "hover:bg-red-900/30 cursor-pointer"
                            : ""
                        }`}
                        onClick={
                          !singleRelease
                            ? () => toggleArtist(artist)
                            : undefined
                        }
                      >
                        <td
                          className={`px-6 py-4 font-medium flex items-center ${artistStyle} group-hover:text-red-500`}
                        >
                          {!singleRelease && (
                            <svg
                              className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                                expandedArtists[artist] ? "rotate-90" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                          {artist}
                          {badgeCount > 1 && (
                            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-xs font-semibold px-2 py-0.5 text-white">
                              {badgeCount}
                            </span>
                          )}
                        </td>
                        {singleRelease ? (
                          <>
                            <td className="px-6 py-4">
                              {artistReleases[0].album}
                            </td>
                            <td className="px-6 py-4 text-zinc-400">
                              {artistReleases[0].label}
                            </td>
                            <td className="px-6 py-4 text-zinc-400">
                              {artistReleases[0].genre}
                            </td>
                            <td className="px-6 py-4">
                              {artistReleases[0].release_type === "new" ? (
                                <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                  {artistReleases[0].release_type}
                                </span>
                              ) : (
                                <span className="text-zinc-400">
                                  {artistReleases[0].release_type}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                checked={
                                  favorites[
                                    `${artist}::${artistReleases[0].album}`
                                  ] || false
                                }
                                onChange={() =>
                                  toggleFavorite(
                                    artist,
                                    artistReleases[0].album
                                  )
                                }
                              />
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                            <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                            <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                            <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                            <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                          </>
                        )}
                      </tr>

                      {!singleRelease &&
                        expandedArtists[artist] &&
                        artistReleases.map((release, idx) => {
                          const albumStyle = release.album_in_library
                            ? "text-red-500"
                            : "text-zinc-400";
                          const artistStyle = release.artist_in_library
                            ? "text-red-500"
                            : "text-zinc-300";
                          const key = `${artist}::${release.album}`;

                          return (
                            <tr
                              key={idx}
                              className={`border-t border-zinc-700/50 transition-colors group ${
                                (artistIndex + idx + 1) % 2 === 0
                                  ? "bg-zinc-900"
                                  : "bg-zinc-950"
                              } hover:bg-red-900/30`}
                            >
                              <td
                                className={`px-6 py-4 font-medium ${artistStyle}`}
                              >
                                &nbsp;&nbsp;
                              </td>
                              <td className={`px-6 py-4 ${albumStyle}`}>
                                {release.album}
                              </td>
                              <td className="px-6 py-4 text-zinc-400">
                                {release.label}
                              </td>
                              <td className="px-6 py-4 text-zinc-400">
                                {release.genre}
                              </td>
                              <td className="px-6 py-4">
                                {release.release_type === "new" ? (
                                  <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                    {release.release_type}
                                  </span>
                                ) : (
                                  <span className="text-zinc-400">
                                    {release.release_type}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={favorites[key] || false}
                                  onChange={() =>
                                    toggleFavorite(artist, release.album)
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </React.Fragment>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Help Modal */}
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
              <li>o Click an artist row to expand and see albums.</li>
              <li>o Red = in your library, Yellow = similar artist.</li>
              <li>o Counts next to artist show how many albums.</li>
              <li>
                • Data comes from <code>final_releases.json</code>. Replace this
                file to update.
              </li>
              <li>• New = red badge, Reissue = gray label.</li>
            </ul>
            <div className="mt-4">
              <a
                href="https://github.com/texas2pugs/new-spin-app/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-400 hover:text-red-500 underline"
              >
                View full README.md
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
