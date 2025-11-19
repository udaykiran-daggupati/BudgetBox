import { NextResponse } from "next/server";

let serverStore = new Map<string, any>();

export async function POST(req: Request) {
  const body = await req.json();
  const id = body.id;
  const server = serverStore.get(id);

  if (!server || body.lastEdited > server.lastEdited) {
    serverStore.set(id, body);
    return NextResponse.json({ ok: true, stored: body });
  }
  return NextResponse.json({ ok: true, stored: server });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  return NextResponse.json({ ok: true, stored: id ? serverStore.get(id) : null });
}
