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
  target?: string;
  targetType?: NoteTarget;
  targetDisplay?: string;
  showAll?: boolean;
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={15} className="text-zinc-400" />
          <h3 className="font-medium text-white text-sm">
            {showAll ? 'Saved Notes' : 'Notes'}
          </h3>
        </div>
        {target && !adding && (
          <button
            onClick={() => setAdding(true)}
            id="add-note-btn"
            className="flex items-center gap-1 text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded hover:text-white transition-colors"
          >
            <Plus size={12} />
            Add Note
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {adding && target && (
          <div className="bg-zinc-950 rounded border border-zinc-800 p-3">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={`Note about this ${noteTypeLabel}...`}
              className="w-full bg-transparent text-white placeholder-zinc-500 text-xs outline-none resize-none"
              rows={3}
              autoFocus
              id="note-textarea"
            />
            <div className="flex gap-2 mt-2 justify-end">
              <button
                onClick={() => { setAdding(false); setNewContent(''); }}
                className="text-xs text-zinc-400 hover:text-white px-2 py-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newContent.trim()}
                id="save-note-btn"
                className="bg-white text-black text-xs font-medium px-3 py-1 rounded disabled:opacity-40"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {notes.length === 0 && !adding ? (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-xs">
              {showAll ? 'No notes saved yet' : `No notes for this ${noteTypeLabel}`}
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-zinc-950 border border-zinc-800 rounded p-3 text-xs group"
            >
              {showAll && (
                <div className="flex items-center gap-2 mb-1.5 text-zinc-500 font-mono">
                  <span>[{note.type}]</span>
                  <span>{note.targetDisplay}</span>
                </div>
              )}

              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full bg-transparent text-white text-xs outline-none resize-none border border-zinc-700 rounded p-1.5"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs text-zinc-400 hover:text-white px-2 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdate(note.id)}
                      className="bg-white text-black text-xs font-medium px-3 py-1 rounded"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-zinc-800/60 text-zinc-500">
                    <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(note)}
                        className="hover:text-white transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
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
