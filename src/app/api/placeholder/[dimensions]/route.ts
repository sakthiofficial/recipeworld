import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dimensions: string }> }
) {
  const { dimensions } = await params;

  // Parse dimensions (e.g., "400x300" or "100x100")
  const [width, height] = dimensions.split("x").map(Number);

  if (!width || !height || width > 2000 || height > 2000) {
    return NextResponse.json({ error: "Invalid dimensions" }, { status: 400 });
  }

  // Create a simple SVG placeholder
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#f3f4f6"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#gradient)" opacity="0.5"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#e5e7eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="${width / 2}" cy="${height / 2 - 20}" r="${
    Math.min(width, height) * 0.1
  }" fill="#9ca3af"/>
  <text x="${width / 2}" y="${
    height / 2 + 10
  }" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.max(
    12,
    Math.min(width, height) * 0.05
  )}" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
    ${width}×${height}
  </text>
</svg>`;

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
