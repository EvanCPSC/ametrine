import { writable } from 'svelte/store';
import { nanoid } from 'nanoid';
import { type Note, defaultNoteSettings, defaultWindowSettings } from '$lib/Note';
import { emit } from '@tauri-apps/api/event';

export const notes = writable<Note[]>([]);

export async function addNote() {
    const note: Note = {
        note_id: 'note-' + nanoid(8),
        note_settings: { ...defaultNoteSettings },
        window_settings: { ...defaultWindowSettings },
        note_content: ''
    };

    notes.update(current => {
        if (current.some(existingNote => existingNote.note_id === note.note_id)) {
            return current;
        }

        return [...current, note];
    });

    await emit('note-created', note);

    return note;
}

export function removeNote(id: string) {
    notes.update(current => {
        return current.filter(note => note.note_id !== id);
    });

    emit('note-removed', { id });
}

export function updateNoteContent(id: string, content: string) {
    notes.update(current => {
        return current.map(note => {
            if (note.note_id === id) {
                return {
                    ...note,
                    note_content: content
                };
            }

            return note;
        });
    });
}