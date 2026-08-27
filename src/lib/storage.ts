import type { Note } from '$lib/Note';
import { emit } from '@tauri-apps/api/event';

export async function saveNote(note: Note) {
  localStorage.setItem(
    note.id,
    JSON.stringify(note)
  );
  await emit('note-updated', note);
}

export function loadNote(id: string): Note | null {

  const raw = localStorage.getItem(id);

  if (!raw) return null;

  return JSON.parse(raw);
}