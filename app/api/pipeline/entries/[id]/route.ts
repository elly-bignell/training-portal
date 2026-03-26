import { NextResponse } from 'next/server';

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = 'PipelineDaily';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const res = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}/${params.id}`,
      { method: 'DELETE', headers: { 'Authorization': `Bearer ${API_KEY}` } }
    );
    if (!res.ok) return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
