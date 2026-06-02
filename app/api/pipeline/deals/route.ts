import { NextResponse } from 'next/server';

const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const API_KEY = process.env.AIRTABLE_API_KEY!;
const TABLE = 'PipelineDeals';
const URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}`;
const HEADERS = { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' };

export async function GET() {
  try {
    // Airtable caps each page at 100 records — follow the offset token to get them all.
    const allRecords: any[] = [];
    let offset: string | undefined;
    do {
      const params = new URLSearchParams({
        'sort[0][field]': 'CloseDate',
        'sort[0][direction]': 'asc',
        'pageSize': '100',
      });
      if (offset) params.set('offset', offset);
      const res = await fetch(`${URL}?${params.toString()}`, { headers: HEADERS, cache: 'no-store' });
      if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
      const data = await res.json();
      allRecords.push(...data.records);
      offset = data.offset;
    } while (offset);
    return NextResponse.json(allRecords.map((r: any) => ({ id: r.id, ...r.fields })));
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(URL, {
      method: 'POST', headers: HEADERS,
      // typecast lets Airtable auto-create missing single-select options (e.g. new Booker/Closer names)
      body: JSON.stringify({ fields: body, typecast: true }),
    });
    if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: 500 });
    const data = await res.json();
    return NextResponse.json({ id: data.id, ...data.fields });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
