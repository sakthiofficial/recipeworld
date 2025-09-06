import { NextResponse } from "next/server";

export async function GET() {
  const cuisines = [
    "American",
    "Italian",
    "Mexican",
    "Chinese",
    "Japanese",
    "Thai",
    "Indian",
    "French",
    "Mediterranean",
    "Greek",
    "Spanish",
    "Korean",
    "Vietnamese",
    "Turkish",
    "Lebanese",
    "Moroccan",
    "Brazilian",
    "Peruvian",
    "British",
    "German",
    "Russian",
    "Ethiopian",
    "Caribbean",
    "Fusion",
    "Other",
  ];

  return NextResponse.json({
    success: true,
    data: cuisines,
  });
}
