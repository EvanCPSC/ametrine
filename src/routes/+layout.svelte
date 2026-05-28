<script lang="ts">
  import { onMount } from 'svelte';
  import { listen } from '@tauri-apps/api/event';
  import type { Note } from '$lib/Note';
  import { notes } from '$lib/notesStore';

  onMount(() => {
  let unlistenCreated: any;
  let unlistenRemoved: any;

  (async () => {

    unlistenCreated = await listen('note-created', (event) => {
      const incoming = event.payload as { id: string };

      notes.update(current => {
        if (current.some(n => n.id === incoming.id)) return current;
        return [...current, incoming];
      });
    });

    unlistenRemoved = await listen('note-removed', (event) => {
      const { id } = event.payload as { id: string };

      notes.update(current => {
        return current.filter(n => n.id !== id);
      });
    });

    })();

      return () => {
        unlistenCreated?.();
        unlistenRemoved?.();
      };
    });
</script>

<slot />