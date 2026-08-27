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

    <div class="title-container">
      <p id="title-ametrine">Ametrine</p>
      <p id="title-separator">|</p>
      <p id="title-sticky-notes">Sticky Notes</p>
    </div>
    <hr id="title-note-separator">
  <br>

  {#each $notes as note}
    <!-- https://inclusive-components.design/cards/ -->

    <div class="note" on:click={async () => await createWindow(note)}>
      <p class="note-content">{note.content}</p>
      <span class="material-symbols-outlined delete-icon" on:click|stopPropagation={() => deleteNote(note.id)}>
        delete
      </span>
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
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.title-container {
  display: flex;
  justify-content: left;
  align-items: center;
  margin-bottom: 0;
  p {
    margin-top: 1.2rem;
    margin-bottom: 0.8rem;
    margin-left: 0.5rem;
  }
}

#title-ametrine {
  font-size: 24px;
  font-weight: bolder;
  color: var(--secondary-font);
}

#title-separator {
  color: var(--primary-icon);
  font-size: 40px;
  margin-left: 0.4rem;
  margin-right: 0.4rem;
  font-weight: lighter;
  transform: translateY(-3px);
}

#title-sticky-notes {
  font-size: 16px;
  font-weight: lighter;
  color: var(--secondary-font);
}

#title-note-separator {
  margin-left: 0.2rem;
  margin-right: 0.2rem;
  border: none;
  height: 0.05rem;
  background-color: var(--primary-icon);
}

.topnav {
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--container-bg);
  margin: 0;
  box-shadow: none;
}

.topnav button {
  -webkit-app-region: no-drag;
  box-shadow: none;
}

button {
  border: none;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  color: #ffffff;
  background-color: #0f0f0f98;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
  outline: none;
  cursor: pointer;
}

.add-button, .settings-button, .close-button {
  background-color: var(--container-bg);
  transition: 0.2s;
}

.add-icon, .settings-icon, .close-icon {
  color: var(--primary-icon);
  transition: 0.2s;
}

.add-button:hover {
  .add-icon {
    color: var(--hover-icon);
  }
  background-color: var(--hover-add-bg);
  transition: 0.2s;
}

.settings-button:hover {
  .settings-icon {
    color: var(--hover-icon);
  }
  background-color: var(--hover-settings-bg);
  transition: 0.2s;
}

.close-button:hover {
  .close-icon {
    color: var(--hover-icon);
  }
  background-color: var(--hover-close-bg);
  transition: 0.2s;
}

.delete-icon {
  opacity: 0%;
  cursor: pointer;
  color: var(--primary-icon);
  transition: 0.2s;
}

.note-content {
  color: var(--primary-font);
  flex: 1;
  text-align: left;
  padding: 0;
  margin-top: 0;
  margin-right: 0.5rem;
  display: -webkit-box;
  line-clamp: 4;;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}

.note {
  padding: 1rem;
  background-color: var(--container-bg);
  margin-left: 0.4rem;
  margin-right: 0.4rem;
  transition: 0.2s;
  display: flex;
  align-items: flex-start;
}

.note:hover {
  .delete-icon {
    opacity: 100%;
    transition: 0.2s;
  }
  .delete-icon:hover {
    color: var(--secondary-font);
    transition: 0.2s;
  }
  background-color: var(--note-hover-bg);
}

</style>
