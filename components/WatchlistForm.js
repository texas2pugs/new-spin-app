// components/WatchlistForm.js
'use client';
import React, { useState, useEffect } from 'react';

export default function WatchlistForm({ onRefresh, editItem, setEditItem }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    artist: '',
    album: '',
    song: '',
    date: '',
  });

  // Use useEffect to "fill" the form when editItem changes
  useEffect(() => {
    if (editItem) {
      setFormData({
        artist: editItem.artist,
        album: editItem.album,
        song: editItem.song || '',
        date: editItem.date || '',
      });
      setIsOpen(true);
    }
  }, [editItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine if we are updating or creating
    const method = editItem ? 'PUT' : 'POST';
    const body = editItem ? { ...formData, id: editItem.id } : formData;

    try {
      const res = await fetch('/api/watchlist', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setFormData({ artist: '', album: '', song: '', date: '' });
        setIsOpen(false);
        setEditItem(null); // Clear edit state
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 border border-zinc-700/50 rounded-xl p-4 bg-zinc-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-bold text-zinc-400 hover:text-red-500 flex items-center gap-2 transition-colors"
      >
        {isOpen ? '✕ Cancel' : '+ Track Upcoming Album'}
      </button>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Artist"
            required
            className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-600 flex-1 min-w-[150px]"
            value={formData.artist}
            onChange={(e) =>
              setFormData({ ...formData, artist: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Album Title"
            required
            className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-600 flex-1 min-w-[150px]"
            value={formData.album}
            onChange={(e) =>
              setFormData({ ...formData, album: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Notable Song (Optional)"
            className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-200 outline-none focus:border-red-600 flex-1 min-w-[150px]"
            value={formData.song}
            onChange={(e) => setFormData({ ...formData, song: e.target.value })}
          />
          <input
            type="date"
            placeholder="Release Date"
            className="bg-black border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-400 outline-none focus:border-red-600 flex-1 min-w-[150px] [color-scheme:dark]"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white font-bold py-2 px-6 rounded text-sm transition-all"
          >
            {loading ? 'Saving...' : 'Save to Watchlist'}
          </button>
        </form>
      )}
    </div>
  );
}
