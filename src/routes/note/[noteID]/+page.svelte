<script lang="ts">
  import { page } from '$app/state';
  import '../../../app.css';
  import { onMount } from 'svelte';
  import { invoke } from "@tauri-apps/api/core";
  import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { getWindowConfig, type Note } from '$lib/Note';
  import { notes, addNote, removeNote, updateNoteContent } from '$lib/notesStore';
  import { loadNote, saveNote } from '$lib/storage';
  import MarkdownEditor from '$lib/MarkdownEditor.svelte';
  
  let currNote: Note | null = null;

  $: noteID = page.params.noteID;
  
  onMount(() => {
    if (noteID) {
      currNote = loadNote(noteID);

      if (!currNote) {
        currNote = {
          id: noteID,
          content: ''
        };
      }
    }
  });

  async function newNote() {
    const note = await addNote();
    return note;
  }

  async function createWindow(note: Note) {

    const win = new WebviewWindow(
      note.id,
      getWindowConfig(note)
    );

    win.once('tauri://created', () => {
      console.log('window created');
    });

    win.once('tauri://error', (e) => {
      console.error(e);
    });
  }

  async function closeWindow() {
    await getCurrentWindow().close();
  }

  let timeout: ReturnType<typeof setTimeout>;

  function onInput() {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (currNote) saveNote(currNote);
    }, 300);
  }

  let showSettings = false;
  let noteColor = 286;

  function updateVariable(value: number) {
  document.documentElement.style.setProperty(
    '--hsl-header-hue',
    `${value}`
  );

}

let alwaysOnTop = false;

function toggleAOT() {
  alwaysOnTop = !alwaysOnTop
  getCurrentWindow().setAlwaysOnTop(alwaysOnTop)
    .catch((err) => console.error("Failed to set always on top:", err));
}

</script>

<nav class="topnav">
  <button on:click={async () => await createWindow(await newNote())} class="add-button">
    <span class="material-symbols-outlined add-icon">
      note_stack_add
    </span>
  </button>
  <div class="right-buttons">
    <button class="minimize-button">
      <span class="material-symbols-outlined minimize-icon">
        collapse_content
      </span>
    </button>
    <button on:click={() => showSettings = !showSettings} class="settings-button">
      <span class="material-symbols-outlined settings-icon">
        settings
      </span>
    </button>
    <button on:click={closeWindow} class="close-button">
      <span class="material-symbols-outlined close-icon">
        close
      </span>
    </button>
  </div>
</nav>

<main class="container">
  <!-- <h1>Note {noteID}</h1> -->
  {#if showSettings}
    <div class="settings-container">
      <input
        type="range"
        min="0"
        max="360"
        bind:value={noteColor}
        on:input={() => updateVariable(noteColor)}
        class="settings-color"
      />
      <button
        on:click={() => toggleAOT()}
        class="settings-aot"
        style:background-color={alwaysOnTop ? 'var(--hsl-header-opp)' : 'var(--hsl-header)'}
      >
        <span class="material-symbols-outlined aot-icon">
          {alwaysOnTop ? 'keep_off' : 'keep'}
        </span>
      </button>
    </div>
  {/if}
  <br>
  {#if currNote}
    <MarkdownEditor
      content={currNote.content}
      onChange={(content) => {
          if (currNote) {
            currNote.content = content;
            onInput();
          }
      }}
    />
  {:else}
    <pre>{JSON.stringify(currNote, null, 2)}</pre>
  {/if}
</main>

<style>

:root {
  font-family: 'Nunito Sans', sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: var(--primary-font);
  background-color: var(--primary-bg);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
}

:global(html), :global(body) {
  margin: 0;
  padding: 0;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

:global(html::-webkit-scrollbar), :global(body::-webkit-scrollbar) {
  display: none; /* Chrome, Safari, and Opera */
}

.container {
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.topnav {
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--hsl-header);
  margin: 0;
  box-shadow: none;
  transition: 0.2s;
  position: sticky;
  top: 0;
  z-index: 100;
}

.topnav button {
  -webkit-app-region: no-drag;
  box-shadow: none;
}

button {
  border: none;
  padding: 0.4em 0.5em;
  font-size: 0.4em;
  font-weight: 400;
  font-family: inherit;
  outline: none;
  cursor: pointer;
}

.add-button, .minimize-button, .settings-button, .close-button, .settings-aot {
  background-color: var(--hsl-header);
  transition: 0.2s;
}

.add-icon, .minimize-icon, .settings-icon, .close-icon, .aot-icon {
  color: var(--hsl-icon);
}

.add-button:hover, .minimize-button:hover, .settings-button:hover, .close-button:hover, .settings-aot:hover {
  background-color: hsl(var(--hsl-header-hue), var(--hsl-header-saturation), calc(var(--hsl-header-lightness) - 20%));
  transition: 0.2s;
}

.settings-container {
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 2.1rem;
  z-index: 99;
  background-color: var(--primary-bg);
}

.settings-color {
  appearance: none;
  width: 100%;
  margin-right: 0.5rem;
  background: transparent;
  cursor: pointer;
}

.settings-color:focus {
  outline: none;
}

.settings-color::-webkit-slider-runnable-track {
  background: var(--hsl-header-opp);
  height: 0.5rem;
  border-radius: 0.25rem;
  transition: 0.2s;
}

.settings-color::-moz-range-track {
  background: var(--hsl-header-opp);
  height: 0.5rem;
  border-radius: 0.25rem;
  transition: 0.2s;
}

.settings-color::-webkit-slider-thumb {
  appearance: none;
  background-color: var(--hsl-header);
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  margin-top: -0.25rem;
  transition: 0.2s;
}

textarea {
  border-radius: 8px;
  border: none;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}


</style>