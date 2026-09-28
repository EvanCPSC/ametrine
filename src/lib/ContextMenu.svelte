
<script lang="ts">
  import { tick } from 'svelte';

  type MenuItem =
    | {
        label: string;
        action: () => void;
        disabled?: boolean;
      }
    | {
        separator: true;
      };

  let items: MenuItem[] = [];
  let visible = false;
  let x = 0;
  let y = 0;
  let menuElement: HTMLDivElement;

  export async function show(
    event: MouseEvent,
    menuItems: MenuItem[]
  ) {
    event.preventDefault();
    event.stopPropagation();

    items = menuItems;
    x = event.clientX;
    y = event.clientY;
    visible = true;

    await tick();

    // Keep the menu inside the window.
    if (menuElement) {
      const rect = menuElement.getBoundingClientRect();

      x = Math.max(
        0,
        Math.min(x, window.innerWidth - rect.width)
      );

      y = Math.max(
        0,
        Math.min(y, window.innerHeight - rect.height)
      );
    }
  }

  function close() {
    visible = false;
  }

  function selectItem(item: MenuItem) {
    if ('separator' in item || item.disabled) return;

    close();
    item.action();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }
</script>

<svelte:window
  on:click={close}
  on:keydown={handleKeydown}
  on:blur={close}
/>

{#if visible}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div
    bind:this={menuElement}
    class="context-menu"
    style:left="{x}px"
    style:top="{y}px"
    role="menu"
    on:click|stopPropagation
    on:contextmenu|preventDefault|stopPropagation
  >
    {#each items as item}
        {#if 'separator' in item}
            <div class="separator" role="separator"></div>
        {:else}
            <button
                type="button"
                role="menuitem"
                disabled={item.disabled ? false : undefined}
                on:click={() => selectItem(item)}
            >
                {item.label}
            </button>
        {/if}
    {/each}
  </div>
{/if}

<style>
  .context-menu {
    position: fixed;
    z-index: 9999;
    min-width: 6rem;
    padding: 0.25rem;
    background: var(--container-bg, #282828);
    color: var(--primary-font, white);
    border: 0.05rem solid rgba(128, 128, 128, 0.3);
    border-radius: 0.5rem;
    box-shadow: 0 0.4rem 1.25rem rgba(0, 0, 0, 0.2);
    font-size: 0.75rem;
  }

  button {
    display: block;
    width: 100%;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.3rem;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
  }

  button:hover:not(:disabled) {
    background: rgba(128, 128, 128, 0.2);
  }

  button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .separator {
    height: 0.05rem;
    margin: 0.3rem 0.25rem;
    background: rgba(128, 128, 128, 0.3);
  }
</style>