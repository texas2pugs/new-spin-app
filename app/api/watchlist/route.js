// app/api/watchlist/route.js
import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const newItem = await request.json();
    // Path to where your data files live
    const filePath = path.join(process.cwd(), 'public', 'watchlist.json');

    // 1. Read the current file (return empty array if it doesn't exist yet)
    let watchlist = [];
    try {
      const fileData = await fs.readFile(filePath, 'utf8');
      watchlist = JSON.parse(fileData);
    } catch (e) {
      watchlist = [];
    }

    // 2. Add the new entry with a unique ID
    watchlist.push({ ...newItem, id: Date.now() });

    // 3. Save it back to the public folder
    await fs.writeFile(filePath, JSON.stringify(watchlist, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist API Error:', error);
    return NextResponse.json(
      { error: 'Failed to save to watchlist' },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const filePath = path.join(process.cwd(), 'public', 'watchlist.json');

    const fileData = await fs.readFile(filePath, 'utf8');
    let watchlist = JSON.parse(fileData);

    // Filter out the item with the matching ID
    // Note: Use Number(id) because Date.now() is a number, but URL params are strings
    const updatedWatchlist = watchlist.filter((item) => item.id !== Number(id));

    await fs.writeFile(filePath, JSON.stringify(updatedWatchlist, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const updatedItem = await request.json();
    const filePath = path.join(process.cwd(), 'public', 'watchlist.json');

    const fileData = await fs.readFile(filePath, 'utf8');
    let watchlist = JSON.parse(fileData);

    // Replace the old item with the new one
    const updatedWatchlist = watchlist.map((item) =>
      item.id === updatedItem.id ? updatedItem : item,
    );

    await fs.writeFile(filePath, JSON.stringify(updatedWatchlist, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 },
    );
  }
}
