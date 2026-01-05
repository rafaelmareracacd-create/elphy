"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Link } from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Highlighter, Type, Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
    Undo, Redo, Eraser, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string; // Additional classes for the container
}

const COLORS = [
    { label: 'Preto', value: '#000000' },
    { label: 'Esmeralda', value: '#10b981' },
    { label: 'Azul', value: "#3b82f6" },
    { label: 'Roxo', value: "#a855f7" },
    { label: 'Vermelho', value: "#ef4444" },
    { label: 'Laranja', value: "#f97316" },
];

export default function RichTextEditor({ value, onChange, placeholder, className = "" }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            Subscript,
            Superscript,
            Image,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Link.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: placeholder || 'Digite aqui...' }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose-base focus:outline-none min-h-[120px] max-w-none px-4 py-3 text-gray-700 dark:text-slate-200 dark:prose-invert [&_img]:max-w-full [&_img]:rounded-lg [&_img]:shadow-sm',
            },
        },
        immediatelyRender: false // Fix hydration mismatch
    });

    // Sync editor content when value prop changes (important for edit mode)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) {
        return null;
    }

    const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title }: any) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`p-1.5 rounded-md transition-all ${isActive
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={title}
        >
            {children}
        </button>
    );

    const addImage = () => {
        const url = window.prompt("URL da imagem:");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className={`border border-gray-100 dark:border-white/10 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm shadow-xl shadow-gray-200/20 dark:shadow-none focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500/30 transition-all ${className}`}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100/50 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50 backdrop-blur-md">
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Negrito"
                >
                    <Bold size={15} strokeWidth={2.5} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Itálico"
                >
                    <Italic size={15} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    isActive={editor.isActive('underline')}
                    title="Sublinhado"
                >
                    <UnderlineIcon size={15} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Tachado"
                >
                    <Strikethrough size={15} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 opacity-50" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSubscript().run()}
                    isActive={editor.isActive('subscript')}
                    title="Subscrito"
                >
                    <SubscriptIcon size={15} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleSuperscript().run()}
                    isActive={editor.isActive('superscript')}
                    title="Sobrescrito"
                >
                    <SuperscriptIcon size={15} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-200 mx-1 opacity-50" />

                <ToolbarButton
                    onClick={addImage}
                    isActive={editor.isActive('image')}
                    title="Inserir Imagem"
                >
                    <ImageIcon size={15} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-200 mx-1 opacity-50" />

                <div className="flex items-center gap-1 px-1">
                    {COLORS.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => editor.chain().focus().setColor(color.value).run()}
                            className={`w-3.5 h-3.5 rounded-full border border-gray-200 dark:border-white/10 transition-all hover:scale-125 ${editor.isActive('textStyle', { color: color.value }) ? 'ring-2 ring-emerald-500 ring-offset-2' : ''}`}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                        />
                    ))}
                </div>

                <div className="w-px h-5 bg-gray-200 mx-1 opacity-50" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    isActive={editor.isActive('highlight')}
                    title="Realçar"
                >
                    <Highlighter size={15} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-200 mx-1 opacity-50" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Alinhar à Esquerda"
                >
                    <AlignLeft size={15} />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Centralizar"
                >
                    <AlignCenter size={15} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 opacity-50" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Lista com Marcadores"
                >
                    <List size={15} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Lista Numerada"
                >
                    <ListOrdered size={15} />
                </ToolbarButton>

                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1 opacity-50 ml-auto" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                    title="Limpar Formatação"
                >
                    <Eraser size={15} />
                </ToolbarButton>
            </div>

            <EditorContent editor={editor} className="bg-white/20 dark:bg-transparent" />
        </div>
    );
}
