// app/notes/page.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import PasswordGate from "@/components/PasswordGate";
import WeekScheduleCompare from "@/components/WeekScheduleCompare";

interface Note {
  id: string;
  content: string;
  type: "well" | "not-well" | "plan" | "actual";
  createdAt: string;
  updatedAt: string;
}

function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [wellInput, setWellInput] = useState("");
  const [notWellInput, setNotWellInput] = useState("");
      const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (editingId && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = "auto";
      editRef.current.style.height = editRef.current.scrollHeight + "px";
    }
  }, [editingId]);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
    } catch {
      console.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  }

  async function addNote(type: Note["type"]) {
    const inputMap: Record<string, string> = { well: wellInput, "not-well": notWellInput };
    const content = inputMap[type];
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), type }),
      });
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      if (type === "well") setWellInput("");
      if (type === "not-well") setNotWellInput("");
    } catch {
      console.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  }

  async function updateNote(id: string) {
    if (!editContent.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/notes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content: editContent.trim() }),
      });
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, content: editContent.trim(), updatedAt: new Date().toISOString() } : n
        )
      );
      setEditingId(null);
    } catch {
      console.error("Failed to update note");
    } finally {
      setSaving(false);
    }
  }

  async function deleteNote(id: string) {
    try {
      await fetch("/api/notes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setDeleteConfirm(null);
    } catch {
      console.error("Failed to delete note");
    }
  }

  function formatDate(iso: string) {
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
  }

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }

  const wellNotes = notes.filter((n) => n.type === "well" || (!n.type));
  const notWellNotes = notes.filter((n) => n.type === "not-well");

  function NoteCard({ note }: { note: Note }) {
    const isEditing = editingId === note.id;
    const colorMap: Record<string, { border: string; hover: string }> = {
      well: { border: "border-emerald-200", hover: "hover:border-emerald-300" },
      "not-well": { border: "border-red-200", hover: "hover:border-red-300" },
      plan: { border: "border-blue-200", hover: "hover:border-blue-300" },
      actual: { border: "border-amber-200", hover: "hover:border-amber-300" },
    };
    const colors = colorMap[note.type] || colorMap.well;

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Portal
          </Link>
          <Link href="/admin" className="text-slate-400 hover:text-white transition-colors text-sm">
            Admin Dashboard →
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">📝 Weekly Review</h1>
          <p className="text-slate-500 mt-1">Wins, lessons & weekly planning — admin only</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">
            <div className="inline-block w-6 h-6 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-sm">Loading notes...</p>
          </div>
        ) : (
          <>
            {/* ═══ Wins & Losses Split ═══ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              {/* What Went Well */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-lg">✅</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">What Went Well</h2>
                    <p className="text-xs text-slate-400">Wins, breakthroughs & positives</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-emerald-200 p-3 mb-4 shadow-sm focus-within:border-emerald-400 focus-within:shadow-md transition-all">
                  <textarea
                    value={wellInput}
                    onChange={(e) => { setWellInput(e.target.value); autoResize(e.target); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addNote("well"); }
                    }}
                    placeholder="Add a win... (⌘+Enter to save)"
                    className="w-full resize-none outline-none text-sm text-slate-700 placeholder-slate-400 min-h-[50px]"
                    rows={2}
                  />
                  <div className="flex items-center justify-end mt-2 pt-2 border-t border-emerald-100">
                    <button
                      onClick={() => addNote("well")}
                      disabled={!wellInput.trim() || saving}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        wellInput.trim() && !saving
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {saving ? "Saving..." : "Add Win"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {wellNotes.length === 0 ? (
                    <div className="text-center py-8 text-slate-300">
                      <div className="text-2xl mb-1">🎯</div>
                      <p className="text-xs">No wins logged yet</p>
                    </div>
                  ) : (
                    wellNotes.map((note) => <NoteCard key={note.id} note={note} />)
                  )}
                </div>
              </div>

              {/* What Didn't Go Well */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-lg">⚠️</div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">What Didn&apos;t Go Well</h2>
                    <p className="text-xs text-slate-400">Lessons, blockers & areas to improve</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-red-200 p-3 mb-4 shadow-sm focus-within:border-red-400 focus-within:shadow-md transition-all">
                  <textarea
                    value={notWellInput}
                    onChange={(e) => { setNotWellInput(e.target.value); autoResize(e.target); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addNote("not-well"); }
                    }}
                    placeholder="Add a lesson... (⌘+Enter to save)"
                    className="w-full resize-none outline-none text-sm text-slate-700 placeholder-slate-400 min-h-[50px]"
                    rows={2}
                  />
                  <div className="flex items-center justify-end mt-2 pt-2 border-t border-red-100">
                    <button
                      onClick={() => addNote("not-well")}
                      disabled={!notWellInput.trim() || saving}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        notWellInput.trim() && !saving
                          ? "bg-red-600 text-white hover:bg-red-700 shadow-sm"
                          : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      {saving ? "Saving..." : "Add Lesson"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {notWellNotes.length === 0 ? (
                    <div className="text-center py-8 text-slate-300">
                      <div className="text-2xl mb-1">📋</div>
                      <p className="text-xs">No lessons logged yet</p>
                    </div>
                  ) : (
                    notWellNotes.map((note) => <NoteCard key={note.id} note={note} />)
                  )}
                </div>
              </div>
            </div>

            {/* ═══ Weekly Plan vs Actual ═══ */}
            <div className="border-t-2 border-slate-200 pt-8">
              <WeekScheduleCompare />
            </div>          </>
        )}
      </div>
    </div>
  );
}

export default function NotesWrapper() {
  return (
    <PasswordGate requireMaster>
      <NotesPage />
    </PasswordGate>
  );
}
