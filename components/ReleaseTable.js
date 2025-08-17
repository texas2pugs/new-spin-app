"use client";
import React, { useEffect, useState } from "react";

export default function ReleaseTable() {
  const [releases, setReleases] = useState([]);
  const [groupedReleases, setGroupedReleases] = useState({});
  const [expandedArtists, setExpandedArtists] = useState(new Set());
  const [summary, setSummary] = useState({
    totalArtists: 0,
    totalAlbums: 0,
    newCount: 0,
    reissueCount: 0,
  });

  useEffect(() => {
    fetch("/final_releases.json")
      .then((res) => res.json())
      .then((data) => {
        setReleases(data);

        // Summary
        const artistsSet = new Set();
        let newCount = 0;
        let reissueCount = 0;
        data.forEach((r) => {
          artistsSet.add(r.artist);
          if (r.release_type.toLowerCase() === "new") newCount++;
          if (r.release_type.toLowerCase() === "reissue") reissueCount++;
        });
        setSummary({
          totalArtists: artistsSet.size,
          totalAlbums: data.length,
          newCount,
          reissueCount,
        });

        // Group by artist
        const grouped = {};
        data.forEach((r) => {
          if (!grouped[r.artist]) grouped[r.artist] = [];
          grouped[r.artist].push(r);
        });
        setGroupedReleases(grouped);
      })
      .catch((err) => console.error("Error loading releases:", err));
  }, []);

  const toggleArtist = (artist) => {
    const newSet = new Set(expandedArtists);
    if (newSet.has(artist)) newSet.delete(artist);
    else newSet.add(artist);
    setExpandedArtists(newSet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center tracking-tight text-red-600 drop-shadow-[0_0_6px_rgba(139,0,0,0.5)]">
          New Spin
        </h1>

        {/* Summary */}
        <div className="mb-6 text-center text-zinc-300">
          <span className="font-semibold">{summary.totalArtists} artists</span>,{" "}
          <span className="font-semibold">{summary.totalAlbums} albums</span> (
          <span className="text-red-500 font-semibold">
            {summary.newCount} new
          </span>
          ,{" "}
          <span className="text-purple-400 font-semibold">
            {summary.reissueCount} reissue
          </span>
          )
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
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedReleases).map(
                ([artist, albums], artistIndex) => {
                  const isExpanded = expandedArtists.has(artist);
                  const artistInLibrary = albums.some(
                    (r) => r.artist_in_library
                  );

                  // Artist row style
                  const artistRowStyle = `cursor-pointer font-medium ${
                    artistInLibrary ? "text-red-500" : "text-zinc-300"
                  } hover:text-red-500`;

                  return (
                    <React.Fragment key={artistIndex}>
                      {/* Artist Row */}
                      <tr
                        onClick={() => toggleArtist(artist)}
                        className={`border-t border-zinc-700/50 transition-colors group ${
                          artistIndex % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"
                        } hover:bg-red-900/30`}
                      >
                        <td
                          className={`px-6 py-4 ${artistRowStyle}`}
                          colSpan={5}
                        >
                          {isExpanded ? "▼ " : "▶ "} {artist}
                        </td>
                      </tr>

                      {/* Nested album rows */}
                      {isExpanded &&
                        albums.map((release, index) => {
                          const {
                            artist_in_library,
                            album_in_library,
                            similar_artist,
                          } = release;

                          const albumStyle = album_in_library
                            ? "text-red-500"
                            : "text-zinc-400";
                          const artistStyle = artist_in_library
                            ? "text-red-500"
                            : similar_artist
                            ? "text-yellow-400"
                            : "text-zinc-200";

                          return (
                            <tr
                              key={index}
                              className={`border-t border-zinc-700/50 transition-colors group ${
                                index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"
                              } hover:bg-red-900/30`}
                            >
                              <td
                                className={`px-6 py-4 font-medium ${artistStyle}`}
                              >
                                &nbsp;&nbsp;{/* indent */}
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
                                {release.release_type.toLowerCase() ===
                                "new" ? (
                                  <span className="inline-block px-3 py-1 text-sm font-semibold text-red-100 bg-red-700 rounded-full shadow-sm">
                                    {release.release_type.toLowerCase()}
                                  </span>
                                ) : release.release_type.toLowerCase() ===
                                  "reissue" ? (
                                  <span className="inline-block px-3 py-1 text-sm font-semibold text-purple-100 bg-purple-700 rounded-full shadow-sm">
                                    {release.release_type.toLowerCase()}
                                  </span>
                                ) : (
                                  <span className="text-gray-300">
                                    {release.release_type.toLowerCase()}
                                  </span>
                                )}
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
    </div>
  );
}
