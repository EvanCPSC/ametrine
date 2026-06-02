import { nanoid } from 'nanoid';

export interface Note {
  id: string;
  data: string;
}

export function createNote(): Note {
  return {
    id: "note-" + nanoid(8),
    data: ""
  };
}

export function getWindowConfig(note: Note) {
  return {
    url: '/note/' + note.id,
    title: 'Note',
    width: 288,
    height: 320,
    decorations: false,
    minHeight: 160,
    minWidth: 144,
    resizable: true,
  };
}