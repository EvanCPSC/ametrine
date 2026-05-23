import { nanoid } from 'nanoid';
export class Note {
    id: string;

    constructor() {
        this.id = "note-" + nanoid(8);
    }

    getID() {
        return `${this.id}`;
    }

    windowConfig() {
        return {
            url: '/note/' + this.id,
            title: 'Note',
            width: 288,
            height: 320,
            decorations: false,
            minHeight: 160,
            minWidth: 144,
            resizable: true,
        }
    }
}