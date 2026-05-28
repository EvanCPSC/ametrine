<script lang="ts">
  import { invoke } from "@tauri-apps/api/core";
  import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
  import { getCurrentWindow } from '@tauri-apps/api/window';
  import { getWindowConfig } from '$lib/Note';
  import { notes, addNote, removeNote } from '$lib/notesStore';


  async function createWindow() {
    const note = await addNote();

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

</script>

<nav class="topnav">
  <button on:click={createWindow}>+</button>
  <div class="right-buttons">
    <button>*</button>
    <button on:click={closeWindow}>X</button>
  </div>
</nav>

<main class="container">
  <h1>Ametrine Sticky Notes</h1>
  <br>
  {#each $notes as note}
    <div class="note">
      <h3>{note.id}</h3>
      <p>Lorem ipsum</p>
      <button on:click={() => removeNote(note.id)}>X</button>
    </div>
    <br>
  {/each}
</main>

<style>

:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;

  color: #0f0f0f;
  background-color: #f6f6f6;

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
}

.topnav button {
  -webkit-app-region: no-drag;
}

a {
  font-weight: 500;
  color: #646cff;
  text-decoration: inherit;
}

a:hover {
  color: #535bf2;
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
  color: #0f0f0f;
  background-color: #ffffff;
  transition: border-color 0.25s;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
}

button {
  cursor: pointer;
}

button:hover {
  border-color: #396cd8;
}
button:active {
  border-color: #396cd8;
  background-color: #e8e8e8;
}

input,
button {
  outline: none;
}


@media (prefers-color-scheme: dark) {
  :root {
    color: #f6f6f6;
    background-color: #2f2f2f;
  }

  a:hover {
    color: #24c8db;
  }

  input,
  button {
    color: #ffffff;
    background-color: #0f0f0f98;
  }
  button:active {
    background-color: #0f0f0f69;
  }
}

</style>
