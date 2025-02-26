// app/api/auth/chapters/[id]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  return NextResponse.json({ message: `Chapter ID: ${id}` });
}

export async function POST(request: Request) {
  const data = await request.json();
  // Process data here
  return NextResponse.json({ message: "Data received", data });
}
