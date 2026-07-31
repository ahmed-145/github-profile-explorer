'use client';

import { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit3, Check, X } from 'lucide-react';
import {
  Note,
  NoteTarget,
  getAllNotes,
  getNotesForTarget,
  saveNote,
  updateNote,
  deleteNote,
} from '@/lib/notes';
import { formatDistanceToNow } from 'date-fns';

interface NotesPanelProps {
  target?: string;          // if provided, shows notes for this target only
  targetType?: NoteTarget;  // 'user' | 'repo'
  targetDisplay?: string;   // human label for note creation
  showAll?: boolean;        // show all notes (for homepage)
}

export default function NotesPanel({
  target,
  targetType = 'user',
  targetDisplay,
  showAll = false,
}: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [adding, setAdding] = useState(false);

  const load = () => {
    if (showAll) {
      setNotes(getAllNotes());
    } else if (target) {
      setNotes(getNotesForTarget(target));
    }
  };

  useEffect(() => {
    load();
  }, [target, showAll]);

  const handleAdd = () => {
    if (!newContent.trim() || !target || !targetType) return;
    saveNote(targetType, target, targetDisplay ?? target, newContent.trim());
    setNewContent('');
    setAdding(false);
    load();
  };

  const handleUpdate = (id: string) => {
    if (!editContent.trim()) return;
    updateNote(id, editContent.trim());
    setEditingId(null);
    setEditContent('');
    load();
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
    load();
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const noteTypeLabel = targetType === 'repo' ? 'repo' : 'profile';

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-space-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-pink flex items-center justify-center">
            <StickyNote size={16} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-space-100 text-sm">
              {showAll ? 'All Notes' : `Notes`}
            </h3>
            <p className="text-xs text-space-400">
              {showAll
                ? `${notes.length} saved note${notes.length !== 1 ? 's' : ''}`
                : `Notes about this ${noteTypeLabel}`}
            </p>
          </div>
        </div>
        {target && !adding && (
          <button
            onClick={() => setAdding(true)}
            id="add-note-btn"
            className="flex items-center gap-1.5 text-xs btn-secondary px-3 py-1.5"
          >
            <Plus size={13} />
            Add Note
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Add note form */}
        {adding && target && (
          <div className="bg-space-800/60 rounded-xl p-3 border border-accent-orange/20">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={`Add a note about this ${noteTypeLabel}...`}
              className="input-field resize-none text-sm"
              rows={3}
              autoFocus
              id="note-textarea"
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={() => { setAdding(false); setNewContent(''); }}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <X size={12} />
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newContent.trim()}
                id="save-note-btn"
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 relative z-10 disabled:opacity-40"
              >
                <Check size={12} />
                Save
              </button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 && !adding ? (
          <div className="text-center py-6">
            <StickyNote className="mx-auto text-space-600 mb-2" size={28} />
            <p className="text-space-400 text-sm">
              {showAll ? 'No notes saved yet' : `No notes for this ${noteTypeLabel} yet`}
            </p>
            {target && (
              <button
                onClick={() => setAdding(true)}
                className="text-accent-purple text-xs mt-2 hover:underline"
              >
                Add your first note
              </button>
            )}
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-space-800/40 rounded-xl p-3.5 border border-space-700/40 group hover:border-space-600/60 transition-colors"
            >
              {/* Note header */}
              {showAll && (
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      note.type === 'repo'
                        ? 'bg-accent-blue/10 text-accent-blue border border-accent-blue/20'
                        : 'bg-accent-purple/10 text-accent-purple border border-accent-purple/20'
                    }`}
                  >
                    {note.type}
                  </span>
                  <span className="text-xs text-space-400 font-mono">{note.targetDisplay}</span>
                </div>
              )}

              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="input-field resize-none text-sm"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
                    >
                      <X size={11} />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      className="btn-primary text-xs px-3 py-1 flex items-center gap-1 relative z-10"
                    >
                      <Check size={11} />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-space-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="text-xs text-space-500">
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(note)}
                        className="p-1.5 rounded-lg hover:bg-space-700 text-space-400 hover:text-space-200 transition-colors"
                        aria-label="Edit note"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-space-400 hover:text-red-400 transition-colors"
                        aria-label="Delete note"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
