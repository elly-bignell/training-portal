// app/api/notes/route.ts

import { NextResponse } from "next/server";

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN!;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID!;
const TABLE_NAME = "Notes";

const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

const airtableHeaders = {
  Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type": "application/json",
};

export async function GET() {
  try {
    const res = await fetch(airtableUrl, {
      headers: airtableHeaders,
      cache: "no-store",
    });
    const data = await res.json();
    if (data.error) {
      console.error("Airtable GET error:", data.error);
      return NextResponse.json([]);
    }
    const notes = (data.records || [])
      .map((r: any) => ({
        id: r.id,
        content: r.fields.Content || "",
        type: r.fields.Type || "well",
        createdAt: r.fields.CreatedAt || r.createdTime || "",
        updatedAt: r.fields.UpdatedAt || r.createdTime || "",
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    return NextResponse.json(notes);
  } catch (err) {
    console.error("Airtable GET exception:", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const content = body.content || "";
    const type = body.type || "well";
    const now = new Date().toISOString();

    const payload = {
      records: [
        {
          fields: {
            Content: content,
            Type: type,
            CreatedAt: now,
            UpdatedAt: now,
          },
        },
      ],
    };

    console.log("Airtable POST payload:", JSON.stringify(payload));

    const res = await fetch(airtableUrl, {
      method: "POST",
      headers: airtableHeaders,
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (data.error) {
      console.error("Airtable POST error:", JSON.stringify(data.error));
      return NextResponse.json(
        { error: data.error.message || "Failed to save" },
        { status: 500 }
      );
    }

    const r = data.records[0];
    return NextResponse.json({
      id: r.id,
      content: r.fields.Content || content,
      type: r.fields.Type || type,
      createdAt: r.fields.CreatedAt || r.createdTime || now,
      updatedAt: r.fields.UpdatedAt || r.createdTime || now,
    });
  } catch (err) {
    console.error("Airtable POST exception:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, content } = body;
    const now = new Date().toISOString();

    const res = await fetch(airtableUrl, {
      method: "PATCH",
      headers: airtableHeaders,
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

    if (data.error) {
      console.error("Airtable PUT error:", JSON.stringify(data.error));
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    const r = data.records[0];
    return NextResponse.json({
      id: r.id,
      content: r.fields.Content || content,
      type: r.fields.Type || "well",
      createdAt: r.fields.CreatedAt || r.createdTime || "",
      updatedAt: r.fields.UpdatedAt || now,
    });
  } catch (err) {
    console.error("Airtable PUT exception:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const res = await fetch(`${airtableUrl}/${id}`, {
      method: "DELETE",
      headers: airtableHeaders,
    });
    const data = await res.json();
    if (data.error) {
      console.error("Airtable DELETE error:", JSON.stringify(data.error));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Airtable DELETE exception:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
