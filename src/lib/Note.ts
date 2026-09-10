

export interface NoteSettings {
    color: number;
    always_on_top: boolean;
    minimized: boolean;
}

export const defaultNoteSettings: NoteSettings = {
    color: 286,
    always_on_top: false,
    minimized: false
};

export interface WindowSettings {
    width: number;
    height: number;
    pos_x: number;
    pos_y: number;
}

export const defaultWindowSettings: WindowSettings = {
    width: 288,
    height: 320,
    pos_x: 0,
    pos_y: 0
};

export interface Note {
    note_id: string;
    note_settings: NoteSettings;
    window_settings: WindowSettings;
    note_content: string;
}

export function getWindowConfig(note: Note) {
  return {
    url: '/note/' + note.note_id,
    title: 'Note',
    width: 288,
    height: 320,
    decorations: false,
    minHeight: 196,
    minWidth: 172,
    resizable: true,
  };
}