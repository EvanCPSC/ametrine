import { writable } from 'svelte/store';
import { createNote } from '$lib/Note';
import type { Note } from '$lib/Note';
import { emit } from '@tauri-apps/api/event';

export const notes = writable<Note[]>([]);

export async function addNote() {
    const note = createNote();

    notes.update(current => {
        return [...current, note];
    });

    await emit('note-created', note);

    return note;
}

export function removeNote(id: string) {
    notes.update(current => {
        return current.filter(note => note.id !== id);
    });

    emit('note-removed', {id});
}