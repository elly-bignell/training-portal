// app/api/notes/route.ts

import { NextResponse } from "next/server";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_NAME = "Notes";

const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

const headers = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
};

export async function GET() {
  try {
    const res = await fetch(airtableUrl, {
      headers,
      cache: "no-store",
    });
    const data = await res.json();
    const notes = (data.records || []).map((r: any) => ({
      id: r.id,
      content: r.fields.Content || "",
      type: r.fields.Type || "well",
      createdAt: r.fields.CreatedAt || r.createdTime || "",
      updatedAt: r.fields.UpdatedAt || r.createdTime || "",
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(notes);
  } catch (err) {
    console.error("Airtable GET error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { content, type } = await request.json();
    const now = new Date().toISOString();
    const res = await fetch(airtableUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        records: [
          {
            fields: {
              Content: content,
              Type: type || "well",
              CreatedAt: now,
              UpdatedAt: now,
            },
          },
        ],
      }),
    });
    const data = await res.json();
    const r = data.records[0];
    return NextResponse.json({
      id: r.id,
      content: r.fields.Content || "",
      type: r.fields.Type || type || "well",
      createdAt: r.fields.CreatedAt || r.createdTime || now,
      updatedAt: r.fields.UpdatedAt || r.createdTime || now,
    });
  } catch (err) {
    console.error("Airtable POST error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, content } = await request.json();
    const now = new Date().toISOString();
    const res = await fetch(airtableUrl, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        records: [
          {
            id,
            fields: {
              Content: content,
              UpdatedAt: now,
            },
          },
        ],
      }),
    });
    const data = await res.json();
    const r = data.records[0];
    return NextResponse.json({
      id: r.id,
      content: r.fields.Content || "",
      type: r.fields.Type || "well",
      createdAt: r.fields.CreatedAt || r.createdTime || "",
      updatedAt: r.fields.UpdatedAt || r.createdTime || now,
    });
  } catch (err) {
    console.error("Airtable PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    await fetch(`${airtableUrl}/${id}`, {
      method: "DELETE",
      headers,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Airtable DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
