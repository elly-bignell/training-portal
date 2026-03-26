import { NextResponse } from 'next/server';

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = 'PipelineDaily';
const URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
const HEADERS = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

export async function GET() {
  try {
    const res = await fetch(`${URL}?sort[0][field]=Date&sort[0][direction]=desc&maxRecords=200`, {
      headers: HEADERS, cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ error: 'Airtable fetch failed' }, { status: 500 });
    const data = await res.json();
    return NextResponse.json(data.records.map((r: any) => ({ id: r.id, ...r.fields })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({ fields: body }),
    });
    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }
    const data = await res.json();
    return NextResponse.json({ id: data.id, ...data.fields });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
