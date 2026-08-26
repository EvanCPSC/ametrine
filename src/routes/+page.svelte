<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import '../app.css';
  import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
  import { getCurrentWindow, getAllWindows } from '@tauri-apps/api/window';
  import { getWindowConfig, type Note } from '$lib/Note';
  import { notes, addNote, removeNote } from '$lib/notesStore';

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

  async function deleteNote(id: string) {
    removeNote(id);
    const wins = await getAllWindows();
    wins.find(w => w.label === id)?.close();
  }

</script>

<nav class="topnav">
  <button on:click={async () => await createWindow(await newNote())} class="add-button">
    <span class="material-symbols-outlined add-icon">
      note_stack_add
    </span>
  </button>
  <div class="right-buttons">
    <button class="settings-button">
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
  <h1>Ametrine Sticky Notes</h1>
  <br>
  {#each $notes as note}
    <!-- TODO: fix later lol https://inclusive-components.design/cards/ -->
    <div class="note" on:click={async () => await createWindow(note)}>
      <h3>{note.id}</h3>
      <p>{note.content}</p>
      <button on:click|stopPropagation={() => deleteNote(note.id)}>X</button>
    </div>
    <br>
  {/each}
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

.container {
  margin: 0;
  padding-top: 2vh;
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
  background-color: var(--container-bg);
}

.topnav button {
  -webkit-app-region: no-drag;
}

.note {
  width: 90%;
  padding: 1rem;
  background-color: #4f4f4f;
  margin: auto;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #24c8db;
}

h1 {
  text-align: center;
}

input,
button {
  border-radius: 8px;
  border: none;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #ffffff;
  background-color: #0f0f0f98;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

input,
button {
  outline: none;
}

.add-button, .settings-button, .close-button {
  background-color: var(--container-bg);
}

.add-icon, .settings-icon, .close-icon {
  color: var(--primary-icon);
}

.add-button:hover {
  .add-icon {
    color: var(--hover-icon);
  }
  background-color: var(--hover-add-bg);
  transition: 0.3s;
}

.settings-button:hover {
  .settings-icon {
    color: var(--hover-icon);
  }
  background-color: var(--hover-settings-bg);
  transition: 0.3s;
}

.close-button:hover {
  .close-icon {
    color: var(--hover-icon);
  }
  background-color: var(--hover-close-bg);
  transition: 0.3s;
}

</style>
