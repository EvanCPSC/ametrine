<script lang="ts">
    import { marked } from 'marked';
    import DOMPurify from 'dompurify';
    import { onMount } from 'svelte';
    import '../app.css';

    export let markdown = ``;

    let editing = true;
    let textarea: HTMLTextAreaElement;

    function resizeTextarea() {
        if (!textarea) return;

        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    }

    function startEditing() {
        editing = true;

        setTimeout(() => {
            textarea?.focus();
            resizeTextarea();
        });
    }

    function finishEditing() {
        editing = false;
    }

    function renderMarkdown(text: string): string {
        return DOMPurify.sanitize(marked.parse(text) as string);
    }

    onMount(() => {
        resizeTextarea();
    });
</script>

<div class="obsidian-page">

    {#if editing}

        <textarea
            bind:this={textarea}
            bind:value={markdown}
            oninput={resizeTextarea}
            onblur={finishEditing}
            spellcheck="true"
        ></textarea>

    {:else}

        <div
            class="rendered-page"
            role="button"
            tabindex="0"
            onclick={startEditing}
            onkeydown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    startEditing();
                }
            }}
        >
            {#if markdown.trim()}
                {@html renderMarkdown(markdown)}
            {:else}
                <span class="placeholder"></span>
            {/if}
        </div>

    {/if}

</div>

<style>
    .obsidian-page {
        width: 100%;
        min-height: 100%;
        box-sizing: border-box;
        background: transparent;
        color: var(--primary-font);
        font-size: 16px;
        line-height: 1.6;
    }

    /*
     * EDITOR
     */

    textarea {
        display: block;

        width: 100%;

        box-sizing: border-box;

        margin: 0;
        padding: 0;

        border: none;
        outline: none;
        resize: none;

        background: transparent;
        color: inherit;

        font-family: inherit;
        font-size: inherit;
        line-height: inherit;

        overflow: hidden;
    }

    /*
     * RENDERED PAGE
     */

    .rendered-page {
        text-align: left;
        outline: none;
        cursor: text;
    }

    /*
     * MARKDOWN ELEMENTS
     */

    .rendered-page :global(h1),
    .rendered-page :global(h2),
    .rendered-page :global(h3),
    .rendered-page :global(h4),
    .rendered-page :global(h5),
    .rendered-page :global(h6) {
        color: var(--primary-font);
        font-weight: 600;
        line-height: 1.3;
    }

    .rendered-page :global(h1) {
        margin: 0 0 0.5em;
        font-size: 2em;
    }

    .rendered-page :global(h2) {
        margin: 1.5em 0 0.5em;
        font-size: 1.6em;
    }

    .rendered-page :global(h3) {
        margin: 1.3em 0 0.5em;
        font-size: 1.35em;
    }

    .rendered-page :global(h4),
    .rendered-page :global(h5),
    .rendered-page :global(h6) {
        margin: 1em 0 0.5em;
    }

    .rendered-page :global(p) {
        margin: 0 0 1em;
    }

    .rendered-page :global(strong) {
        font-weight: 700;
    }

    .rendered-page :global(em) {
        font-style: italic;
    }

    .rendered-page :global(code) {
        padding: 0.15em 0.35em;

        border-radius: 4px;

        background: var(--container-bg);

        font-family:
            "SFMono-Regular",
            Consolas,
            "Liberation Mono",
            monospace;

        font-size: 0.9em;
    }

    .rendered-page :global(pre) {
        margin: 1em 0;
        padding: 1em;

        overflow-x: auto;

        border-radius: 6px;

        background: var(--container-bg);
    }

    .rendered-page :global(pre code) {
        padding: 0;

        background: transparent;
    }

    .rendered-page :global(blockquote) {
        margin: 1em 0;
        padding-left: 1em;

        border-left: 3px solid var(--note-hover-bg);

        color: var(--secondary-font);
    }

    .rendered-page :global(ul),
    .rendered-page :global(ol) {
        margin: 0 0 1em;
        padding-left: 2em;
    }

    .rendered-page :global(li) {
        margin: 0.2em 0;
    }

    .rendered-page :global(a) {
        color: #7057a8;
        text-decoration: none;
    }

    .rendered-page :global(a:hover) {
        text-decoration: underline;
    }

    .rendered-page :global(hr) {
        margin: 2em 0;

        border: none;
        border-top: 1px solid #ddd;
    }

    .rendered-page :global(img) {
        max-width: 100%;
        height: auto;
    }

    .placeholder {
        color: #999;
    }
</style>
