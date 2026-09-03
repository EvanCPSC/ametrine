<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorState } from '@codemirror/state';
    import { EditorView, keymap } from '@codemirror/view';
    import { defaultKeymap, indentWithTab } from '@codemirror/commands';
    import { markdown as markdownLanguage } from '@codemirror/lang-markdown';
    import { syntaxHighlighting, HighlightStyle } from '@codemirror/language';
    import { tags } from '@lezer/highlight';

    import '../app.css';

    const noteHighlightStyle = HighlightStyle.define([
        {
            tag: tags.heading,
            fontWeight: '700'
        },
        {
            tag: tags.heading1,
            fontSize: '1.8em',
            fontWeight: '700'
        },
        {
            tag: tags.heading2,
            fontSize: '1.5em',
            fontWeight: '700'
        },
        {
            tag: tags.heading3,
            fontSize: '1.25em',
            fontWeight: '700'
        },
        {
            tag: tags.strong,
            fontWeight: '700'
        },
        {
            tag: tags.emphasis,
            fontStyle: 'italic'
        },
        {
            tag: tags.link,
            textDecoration: 'underline'
        },
        {
            tag: tags.url,
            textDecoration: 'underline'
        },
        {
            tag: tags.monospace,
            fontFamily: 'monospace'
        }
    ]);

    export let content = '';
    export let onChange: (content: string) => void;

    let editor: HTMLDivElement;

    onMount(() => {
        const startState = EditorState.create({
            doc: content,
            extensions: [
                markdownLanguage(),

                syntaxHighlighting(noteHighlightStyle),

                keymap.of([
                    ...defaultKeymap,
                    indentWithTab
                ]),

                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        onChange(update.state.doc.toString());
                    }
                })
            ]
        });

        const view = new EditorView({
            state: startState,
            parent: editor
        });

        return () => {
            view.destroy();
        };
    });
</script>

<div class="obsidian-page">
    <div class="editor" bind:this={editor}></div>
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
        text-align: left;
    }

    .editor {
        width: 100%;
    }

    :global(.cm-editor) {
        width: 100%;
        min-height: 400px;
        background: transparent;
        color: var(--primary-font);
        outline: none;
    }

    :global(.cm-editor.cm-focused) {
        outline: none;
    }

    :global(.cm-scroller) {
        overflow: auto;
        font-family: inherit;
    }

    :global(.cm-content) {
        padding: 0;
        caret-color: var(--primary-font);
    }

    :global(.cm-line) {
        padding: 0;
        caret-color: var(--primary-font);
    }

    :global(.cm-cursor) {
        border-left: 2px solid var(--primary-font);
    }

    /* markdown stuffs */
/*
    :global(.cm-header) {
        font-weight: 700;
    }

    :global(.cm-header-1) {
        font-size: 1.8em;
    }

    :global(.cm-header-2) {
        font-size: 1.5em;
    }

    :global(.cm-header-3) {
        font-size: 1.25em;
    }

    :global(.cm-strong) {
        font-weight: 700;
    }

    :global(.cm-em) {
        font-style: italic;
    }

    :global(.cm-link) {
        text-decoration: underline;
    }

    :global(.cm-url) {
        text-decoration: underline;
    }
        */
</style>
