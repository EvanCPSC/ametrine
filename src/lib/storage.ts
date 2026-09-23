import type { Note } from '$lib/Note';
import { appDataDir, join } from '@tauri-apps/api/path';
import { mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { emit } from '@tauri-apps/api/event';

const notesFile = 'notes.json';

async function getNotesPath() {
    const dataDir = await appDataDir();

    await mkdir(dataDir, {
        recursive: true
    });

    return await join(dataDir, notesFile);
}

export async function saveNote(note: Note) {
    const path = await getNotesPath();

    let notes: Note[] = [];

    try {
        const raw = await readTextFile(path);
        notes = JSON.parse(raw).notes ?? [];
    } catch {
      // notes.json doesn't exist yet
    }

    const existingIndex = notes.findIndex(
        existingNote => existingNote.note_id === note.note_id
    );

    if (existingIndex >= 0) {
        notes[existingIndex] = note;
    } else {
        notes.push(note);
    }

    await writeTextFile(
        path,
        JSON.stringify({ notes }, null, 4)
    );

    await emit('note-updated', note);
}

export async function deleteNote(id: string) {
    const path = await getNotesPath();

    let notes: Note[] = [];

    try {
        const raw = await readTextFile(path);
        notes = JSON.parse(raw).notes ?? [];
    } catch {
        return;
    }

    notes = notes.filter(note => note.note_id !== id);

    await writeTextFile(
        path,
        JSON.stringify({ notes }, null, 4)
    );
}

export async function loadNote(id: string): Promise<Note | null> {
    const path = await getNotesPath();

    try {
        const raw = await readTextFile(path);
        const notes: Note[] = JSON.parse(raw).notes ?? [];

        return notes.find(note => note.note_id === id) ?? null;
    } catch {
        return null;
    }
}

export async function loadNotes(): Promise<Note[]> {
    const path = await getNotesPath();

    try {
        const raw = await readTextFile(path);
        return JSON.parse(raw).notes ?? [];
    } catch {
        return [];
    }
}