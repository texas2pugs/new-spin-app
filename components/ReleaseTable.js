"use client";
import { useEffect, useState } from "react";

export default function ReleaseTable() {
  const [releases, setReleases] = useState([]);

  useEffect(() => {
    fetch("/final_releases.json")
      .then((res) => res.json())
      .then((data) => setReleases(data))
      .catch((err) => console.error("Error loading releases:", err));
  }, []);

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
              </tr>
            </thead>
            <tbody>
              {releases.map((release, index) => {
                const artistHighlight =
                  release.artist_in_library && !release.album_in_library;
                const fullHighlight =
                  release.artist_in_library && release.album_in_library;

                return (
                  <tr
                    key={index}
                    className={`border-t border-zinc-700/50 transition-colors group ${
                      index % 2 === 0 ? "bg-zinc-900" : "bg-zinc-950"
                    } hover:bg-red-900/30`}
                  >
                    <td
                      className={`px-6 py-4 font-medium ${
                        artistHighlight || fullHighlight
                          ? "text-red-500"
                          : "text-zinc-200"
                      } group-hover:text-red-500`}
                    >
                      {release.artist}
                    </td>
                    <td
                      className={`px-6 py-4 ${
                        fullHighlight ? "text-red-500" : "text-zinc-400"
                      } group-hover:text-zinc-200`}
                    >
                      {release.album}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-200">
                      {release.label}
                    </td>
                    <td className="px-6 py-4 text-zinc-400 group-hover:text-zinc-200">
                      {release.genre}
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
