"use client";
import { useEffect, useState } from "react";

export default function ReleaseTable() {
  const [releases, setReleases] = useState([]);
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

        // Calculate summary
        const artistsSet = new Set();
        let newCount = 0;
        let reissueCount = 0;

        data.forEach((r) => {
          artistsSet.add(r.artist);
          if (r.release_type.toLowerCase() === "new") newCount += 1;
          if (r.release_type.toLowerCase() === "reissue") reissueCount += 1;
        });

        setSummary({
          totalArtists: artistsSet.size,
          totalAlbums: data.length,
          newCount,
          reissueCount,
        });
      })
      .catch((err) => console.error("Error loading releases:", err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black text-zinc-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-center tracking-tight text-red-600 drop-shadow-[0_0_6px_rgba(139,0,0,0.5)]">
          New Spin
        </h1>

        {/* Summary Stats */}
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
              {releases.map((release, index) => {
                const { artist_in_library, album_in_library, similar_artist } =
                  release;

                // Determine styles
                const artistStyle = artist_in_library
                  ? "text-red-500"
                  : similar_artist
                  ? "text-yellow-400"
                  : "text-zinc-200";

                const albumStyle = album_in_library
                  ? "text-red-500"
                  : "text-zinc-400";

                return (
                  <tr
                    key={index}
                    className={`border-t border-zinc-700/50 transition-colors group ${
                      index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"
                    } hover:bg-red-900/30`}
                  >
                    <td
                      className={`px-6 py-4 font-medium ${artistStyle} group-hover:text-red-500`}
                    >
                      {release.artist}
                    </td>
                    <td
                      className={`px-6 py-4 ${albumStyle} group-hover:text-zinc-200`}
                    >
                      {release.album}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-200">
                      {release.label}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-200">
                      {release.genre}
                    </td>
                    <td className="px-6 py-4">
                      {release.release_type.toLowerCase() === "new" ? (
                        <span className="inline-block px-3 py-1 text-sm font-semibold text-red-100 bg-red-700 rounded-full shadow-sm">
                          {release.release_type.toLowerCase()}
                        </span>
                      ) : release.release_type.toLowerCase() === "reissue" ? (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
