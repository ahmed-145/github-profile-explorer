export type NoteTarget = 'user' | 'repo';

export interface Note {
  id: string;
  type: NoteTarget;
  target: string;
  targetDisplay: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'github-explorer-notes';

function generateId() {
  return `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getAllNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getNotesForTarget(target: string): Note[] {
  const all = getAllNotes();
  return all.filter((n) => n.target === target);
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
  const index = notes.findIndex((n) => n.id === id);

  if (index === -1) return null;

  notes[index].content = content;
  notes[index].updatedAt = new Date().toISOString();

  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return notes[index];
}

export function deleteNote(id: string) {
  const notes = getAllNotes();
  const filtered = notes.filter((n) => n.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
