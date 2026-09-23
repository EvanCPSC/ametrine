<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import type { Note } from '$lib/Note';
  import { notes } from '$lib/notesStore';

  onMount(() => {
    let unlistenCreated: (() => void) | undefined;
    let unlistenRemoved: (() => void) | undefined;
    let unlistenUpdated: (() => void) | undefined;

    (async () => {
      unlistenCreated = await listen<Note>('note-created', (event) => {
        const incoming = event.payload;

        notes.update(current => {
          if (current.some(n => n.note_id === incoming.note_id)) {
            return current;
          }

          return [...current, incoming];
        });
      });

      unlistenRemoved = await listen<{ id: string }>('note-removed', (event) => {
        const { id } = event.payload;

        notes.update(current => {
          return current.filter(n => n.note_id !== id);
        });
      });

      unlistenUpdated = await listen<Note>('note-updated', (event) => {
        const incoming = event.payload;

        notes.update(current => {
          return current.map(note =>
            note.note_id === incoming.note_id
              ? incoming
              : note
          );
        });
      });
    })();

    return () => {
      unlistenCreated?.();
      unlistenRemoved?.();
      unlistenUpdated?.();
    };
  });
</script>

<slot />