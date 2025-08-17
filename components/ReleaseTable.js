"use client";
import React, { useEffect, useState } from "react";

export default function ReleaseTable() {
  const [releases, setReleases] = useState([]);
  const [expandedArtists, setExpandedArtists] = useState({});

  useEffect(() => {
    fetch("/final_releases.json")
      .then((res) => res.json())
      .then((data) => setReleases(data))
      .catch((err) => console.error("Error loading releases:", err));
  }, []);

  // Group releases by artist
  const grouped = releases.reduce((acc, release) => {
    const artist = release.artist;
    if (!acc[artist]) acc[artist] = [];
    acc[artist].push(release);
    return acc;
  }, {});

  const toggleArtist = (artist) => {
    setExpandedArtists((prev) => ({
      ...prev,
      [artist]: !prev[artist],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center tracking-tight text-red-600 drop-shadow-[0_0_6px_rgba(139,0,0,0.5)]">
          New Spin
        </h1>

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
                    : "text-zinc-300"; // default modern gray

                  const badgeCount = artistReleases.length;
                  return (
                    <React.Fragment key={artist}>
                      <tr
                        className={`border-t border-zinc-700/50 transition-colors group ${
                          artistIndex % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"
                        } hover:bg-red-900/30 cursor-pointer`}
                        onClick={() => toggleArtist(artist)}
                      >
                        <td
                          className={`px-6 py-4 font-medium flex items-center ${artistStyle} group-hover:text-red-500`}
                        >
                          <svg
                            className={`w-4 h-4 mr-2 transition-transform duration-200 ${
                              expandedArtists[artist] ? "rotate-90" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          {artist}
                          <span className="ml-2 inline-flex items-center justify-center rounded-full bg-red-600 text-xs font-semibold px-2 py-0.5 text-white">
                            {badgeCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                        <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                        <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                        <td className="px-6 py-4 text-zinc-400">&nbsp;</td>
                      </tr>

                      {expandedArtists[artist] &&
                        artistReleases.map((release, idx) => {
                          const albumStyle = release.album_in_library
                            ? "text-red-500"
                            : "text-zinc-400";
                          const artistStyle = release.artist_in_library
                            ? "text-red-500"
                            : "text-zinc-300";

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
                                &nbsp;&nbsp;{/* Indent for album row */}
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
