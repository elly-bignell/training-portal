#!/usr/bin/env python3
# Run from: ~/Desktop/training-portal 2/
# Usage: python3 fix-notecard-focus.py

content = open('app/notes/page.tsx').read()

# Extract NoteCard out of NotesPage — define it before NotesPage
# We need to:
# 1. Remove the NoteCard function from inside NotesPage
# 2. Add it as a standalone component above NotesPage with props

# Find and remove the inline NoteCard
old_notecard_start = '  function NoteCard({ note }: { note: Note }) {'
old_notecard_end = '    );\n  }\n\n  return ('

start_idx = content.find(old_notecard_start)
end_idx = content.find(old_notecard_end, start_idx)

if start_idx < 0 or end_idx < 0:
    print("Could not find NoteCard function boundaries")
    exit(1)

notecard_body = content[start_idx:end_idx]

# Remove it from inside NotesPage
content = content[:start_idx] + '  return (' + content[end_idx + len(old_notecard_end):]

# Build the extracted component with props
extracted = '''interface NoteCardProps {
  note: Note;
  editingId: string | null;
  editContent: string;
  saving: boolean;
  deleteConfirm: string | null;
  setEditingId: (id: string | null) => void;
  setEditContent: (content: string) => void;
  setDeleteConfirm: (id: string | null) => void;
  updateNote: (id: string) => void;
  deleteNote: (id: string) => void;
  formatDate: (iso: string) => string;
  autoResize: (el: HTMLTextAreaElement) => void;
}

function NoteCard({ note, editingId, editContent, saving, deleteConfirm, setEditingId, setEditContent, setDeleteConfirm, updateNote, deleteNote, formatDate, autoResize }: NoteCardProps) {
  const isEditing = editingId === note.id;
  const editRef = useRef<HTMLTextAreaElement>(null);
  const colorMap: Record<string, { border: string; hover: string }> = {
    well: { border: "border-emerald-200", hover: "hover:border-emerald-300" },
    "not-well": { border: "border-red-200", hover: "hover:border-red-300" },
    plan: { border: "border-blue-200", hover: "hover:border-blue-300" },
    actual: { border: "border-amber-200", hover: "hover:border-amber-300" },
  };
  const colors = colorMap[note.type] || colorMap.well;

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [isEditing]);

  return (
    <div className={`bg-white rounded-lg border p-3 transition-all ${isEditing ? "border-blue-400 shadow-md" : `${colors.border} ${colors.hover} shadow-sm`}`}>
      {isEditing ? (
        <div>
          <textarea
            ref={editRef}
            value={editContent}
            onChange={(e) => { setEditContent(e.target.value); autoResize(e.target); }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); updateNote(note.id); }
              if (e.key === "Escape") setEditingId(null);
            }}
            className="w-full resize-none outline-none text-sm text-slate-700 min-h-[40px]"
          />
          <div className="flex items-center justify-end gap-2 mt-2 pt-2 border-t border-slate-100">
            <button onClick={() => setEditingId(null)} className="px-2.5 py-1 rounded text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
            <button onClick={() => updateNote(note.id)} disabled={saving} className="px-2.5 py-1 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">{note.content}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] text-slate-400">
              {formatDate(note.createdAt)}
              {note.updatedAt !== note.createdAt && ` · edited`}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Edit"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              {deleteConfirm === note.id ? (
                <div className="flex items-center gap-1">
                  <button onClick={() => deleteNote(note.id)} className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500 text-white hover:bg-red-600">Delete</button>
                  <button onClick={() => setDeleteConfirm(null)} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 hover:bg-slate-100">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(note.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'''

# Insert before "function NotesPage()"
content = content.replace('function NotesPage() {', extracted + 'function NotesPage() {', 1)

# Remove the old editRef since it's now in NoteCard
content = content.replace('  const editRef = useRef<HTMLTextAreaElement>(null);\n', '')

# Remove the old useEffect for editRef focus since it's now in NoteCard
old_effect = '''  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [editingId]);'''
content = content.replace(old_effect + '\n', '')

# Now update all NoteCard usages to pass props
# Find all instances of <NoteCard key={note.id} note={note} />
old_usage = '<NoteCard key={note.id} note={note} />'
new_usage = '<NoteCard key={note.id} note={note} editingId={editingId} editContent={editContent} saving={saving} deleteConfirm={deleteConfirm} setEditingId={setEditingId} setEditContent={setEditContent} setDeleteConfirm={setDeleteConfirm} updateNote={updateNote} deleteNote={deleteNote} formatDate={formatDate} autoResize={autoResize} />'
content = content.replace(old_usage, new_usage)

# Add useRef to the import since NoteCard now uses it at top level
if 'useRef' not in content.split('from "react"')[0]:
    content = content.replace(
        'import { useState, useEffect, useRef } from "react";',
        'import { useState, useEffect, useRef } from "react";'
    )

open('app/notes/page.tsx', 'w').write(content)
print("Done — NoteCard extracted, focus bug fixed")
