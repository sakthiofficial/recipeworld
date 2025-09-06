// Temporarily disable NextAuth route to fix build
// TODO: Fix NextAuth compatibility with Next.js 15

import { NextRequest, NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  return NextResponse.json(
    { error: "NextAuth temporarily disabled" },
    { status: 503 }
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { error: "NextAuth temporarily disabled" },
    { status: 503 }
  );
}
