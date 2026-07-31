// Notes persistence via localStorage
// Works client-side only — check typeof window !== 'undefined' before calling

export type NoteTarget = 'user' | 'repo';

export interface Note {
  id: string;
  type: NoteTarget;
  target: string; // username OR "owner/repo"
  targetDisplay: string; // human-readable label
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'github-explorer-notes';

function generateId(): string {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

export function getNotesForTarget(target: string): Note[] {
  return getAllNotes().filter((n) => n.target === target);
}

export function saveNote(
  type: NoteTarget,
  target: string,
  targetDisplay: string,
  content: string
): Note {
  const notes = getAllNotes();
  const now = new Date().toISOString();
  const newNote: Note = {
    id: generateId(),
    type,
    target,
    targetDisplay,
    content,
    createdAt: now,
    updatedAt: now,
  };
  notes.unshift(newNote);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return newNote;
}

export function updateNote(id: string, content: string): Note | null {
  const notes = getAllNotes();
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  notes[idx] = { ...notes[idx], content, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return notes[idx];
}

export function deleteNote(id: string): void {
  const notes = getAllNotes().filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
