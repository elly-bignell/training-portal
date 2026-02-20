#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 fix-notes.py
#
# Fixes:
# 1. API route: use Airtable's built-in created_time instead of custom CreatedAt field
# 2. Page: formatDate handles invalid/empty dates gracefully

# ─── Fix API route ───
api = open('app/api/notes/route.ts').read()

# Replace the GET handler to use Airtable's built-in created_time
old_get_map = '''    const notes = (data.records || []).map((r: any) => ({
      id: r.id,
      content: r.fields.Content || "",
      createdAt: r.fields.CreatedAt || "",
      updatedAt: r.fields.UpdatedAt || "",
    }));'''

new_get_map = '''    const notes = (data.records || []).map((r: any) => ({
      id: r.id,
      content: r.fields.Content || "",
      createdAt: r.fields.CreatedAt || r.createdTime || "",
      updatedAt: r.fields.UpdatedAt || r.createdTime || "",
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());'''

api = api.replace(old_get_map, new_get_map, 1)

# Fix POST response to also use createdTime fallback
old_post_return = '''    return NextResponse.json({
      id: r.id,
      content: r.fields.Content,
      createdAt: r.fields.CreatedAt,
      updatedAt: r.fields.UpdatedAt,
    });'''

new_post_return = '''    return NextResponse.json({
      id: r.id,
      content: r.fields.Content || "",
      createdAt: r.fields.CreatedAt || r.createdTime || new Date().toISOString(),
      updatedAt: r.fields.UpdatedAt || r.createdTime || new Date().toISOString(),
    });'''

api = api.replace(old_post_return, new_post_return, 1)

# Fix PUT response similarly
old_put_return = '''    return NextResponse.json({
      id: r.id,
      content: r.fields.Content,
      createdAt: r.fields.CreatedAt,
      updatedAt: r.fields.UpdatedAt,
    });'''

new_put_return = '''    return NextResponse.json({
      id: r.id,
      content: r.fields.Content || "",
      createdAt: r.fields.CreatedAt || r.createdTime || "",
      updatedAt: r.fields.UpdatedAt || r.createdTime || new Date().toISOString(),
    });'''

api = api.replace(old_put_return, new_put_return, 1)

# Fix the sort - sort by Airtable's built-in created time instead
# Remove sort param - Airtable may not have this field; we'll sort client-side
api = api.replace(
    '`${airtableUrl}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`',
    'airtableUrl'
)

open('app/api/notes/route.ts', 'w').write(api)
print("✅ Fixed API route — uses Airtable createdTime fallback")

# ─── Fix notes page formatDate ───
page = open('app/notes/page.tsx').read()

old_format = '''  function formatDate(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }'''

new_format = '''  function formatDate(iso: string) {
    if (!iso) return "Just now";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Just now";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }'''

page = page.replace(old_format, new_format, 1)

open('app/notes/page.tsx', 'w').write(page)
print("✅ Fixed formatDate — handles empty/invalid dates")
print("Done")
