<script lang="ts">
    import { onMount } from 'svelte';
    import { EditorState, RangeSetBuilder } from '@codemirror/state';
    import {
        EditorView,
        keymap,
        Decoration,
        WidgetType,
        ViewPlugin
    } from '@codemirror/view';
    import { defaultKeymap, indentWithTab } from '@codemirror/commands';
    import { markdown as markdownLanguage } from '@codemirror/lang-markdown';
    import { GFM } from '@lezer/markdown';
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
        },
        {
            tag: tags.strikethrough,
            textDecoration: 'line-through'
        },
        {
            tag: tags.monospace,
            fontFamily: 'monospace',
            backgroundColor: 'rgba(127, 127, 127, 0.5)',
            padding: '0.1rem 0.25rem',
            borderRadius: '5px'
        },
    ]);

    class CheckboxWidget extends WidgetType {
        checked: boolean;
        view: EditorView;
        from: number;

        constructor(checked: boolean, view: EditorView, from: number) {
            super();
            this.checked = checked;
            this.view = view;
            this.from = from;
        }

        toDOM() {
            const checkbox = document.createElement('input');

            checkbox.type = 'checkbox';
            checkbox.checked = this.checked;

            checkbox.addEventListener('change', () => {
                const newValue = checkbox.checked ? '[x]' : '[ ]';

                this.view.dispatch({
                    changes: {
                        from: this.from,
                        to: this.from + 3,
                        insert: newValue
                    }
                });
            });

            return checkbox;
        }
    }

    const checkboxPlugin = ViewPlugin.fromClass(
        class {
            decorations;

            constructor(view: EditorView) {
                this.decorations = this.buildDecorations(view);
            }

            update(update: any) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }

            buildDecorations(view: EditorView) {
                const decorations = [];

                for (const { from, to } of view.visibleRanges) {
                    const text = view.state.doc.sliceString(from, to);

                    const regex = /- \[([ xX])\]/g;
                    let match;

                    while ((match = regex.exec(text)) !== null) {
                        const start = from + match.index + 2;
                        const end = start + 3;

                        decorations.push(
                            Decoration.replace({
                                widget: new CheckboxWidget(
                                    match[1].toLowerCase() === 'x',
                                    view,
                                    start
                                )
                            }).range(start, end)
                        );
                    }
                }

                return Decoration.set(decorations);
            }
        },
        {
            decorations: value => value.decorations
        }
    );

    const tablePlugin = ViewPlugin.fromClass(
        class {
            decorations;

            constructor(view: EditorView) {
                this.decorations = this.buildDecorations(view);
            }

            update(update: any) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.buildDecorations(update.view);
                }
            }

            buildDecorations(view: EditorView) {
                const builder = new RangeSetBuilder<Decoration>();

                for (const { from, to } of view.visibleRanges) {
                    const startLine = view.state.doc.lineAt(from).number;
                    const endLine = view.state.doc.lineAt(to).number;

                    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
                        const line = view.state.doc.line(lineNumber);
                        const text = line.text.trim();

                        // Only target Markdown table rows
                        if (
                            text.startsWith('|') &&
                            text.endsWith('|') &&
                            text.includes('|', 1)
                        ) {
                            // Top and bottom borders
                            builder.add(
                                line.from,
                                line.to,
                                Decoration.mark({
                                    class: 'cm-table-row'
                                })
                            );

                            // Vertical borders at each |
                            for (let i = 0; i < line.text.length; i++) {
                                if (line.text[i] === '|') {
                                    builder.add(
                                        line.from + i,
                                        line.from + i + 1,
                                        Decoration.mark({
                                            class: 'cm-table-divider'
                                        })
                                    );
                                }
                            }
                        }
                    }
                }

                return builder.finish();
            }
        },
        {
            decorations: value => value.decorations
        }
    );

    export let content = '';
    export let onChange: (content: string) => void;

    let editor: HTMLDivElement;

    const tableKeymap = keymap.of([
        {
            key: 'Enter',
            run: (view) => {
                const line = view.state.doc.lineAt(view.state.selection.main.head);
                const text = line.text;

                // Check if this looks like a Markdown table row
                if (text.trim().startsWith('|') && text.trim().endsWith('|')) {
                    const cursor = view.state.selection.main.head;

                    // Count the cells in the current row
                    const columns = text.trim().slice(1, -1).split('|').length;

                    // Create a new row with the same number of columns
                    const newRow = '\n' + '|  '.repeat(columns) + '|';

                    view.dispatch({
                        changes: {
                            from: cursor,
                            to: cursor,
                            insert: newRow
                        },
                        selection: {
                            anchor: cursor + 3
                        }
                    });

                    return true;
                }

                return false;
            }
        }
    ]);

    onMount(() => {
        const startState = EditorState.create({
            doc: content,
            extensions: [
                markdownLanguage({
                    extensions: [
                        GFM
                    ]
                }),

                syntaxHighlighting(noteHighlightStyle),

                checkboxPlugin,

                tablePlugin,

                tableKeymap,

                EditorView.lineWrapping,

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
        height: calc(100vh - 1.6rem);
        width: 100%;
        box-sizing: border-box;

        background: transparent;
        color: var(--primary-font);

        font-size: 16px;
        line-height: 1.6;
        text-align: left;
    }

    .editor {
        height: 100%;
        width: 100%;
    }

    :global(.cm-editor) {
        height: 100%;
        width: 100%;
        background: transparent;
        color: var(--primary-font);
        outline: none;
    }

    :global(.cm-editor.cm-focused) {
        outline: none;
    }

    :global(.cm-scroller) {
        height: 100%;
        overflow: auto;
        scrollbar-width: none;
        font-family: inherit;
    }

    :global(.cm-scroller::-webkit-scrollbar) {
        display: none;
    }

    :global(.cm-content) {
        min-height: 100%;
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

    :global(.cm-table-row) {
        border-top: 1px solid var(--primary-font);
        border-bottom: 1px solid var(--primary-font);
    }

    :global(.cm-table-divider) {
        border-left: 1px solid var(--primary-font);
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
