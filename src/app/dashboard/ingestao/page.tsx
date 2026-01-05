'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Save, CheckCircle2, AlertCircle, FileText, List, Upload, Trash2 } from 'lucide-react'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'
import { motion, AnimatePresence } from 'framer-motion'

const MATERIAS = [
    'Todas as Matérias',
    'História do Brasil',
    'História Mundial',
    'Política Internacional',
    'Geografia',
    'Economia',
    'Direito',
    'Língua Portuguesa',
    'Língua Inglesa',
    'Outro'
]

// --- Types ---
interface IngestionItem {
    id: string
    materia: string
    examen_ano: number
    examen_turno: string
    comando: string
    texto_associado: string
    num_item: number
    texto_item: string
    gabarito: string
    dica_do_elphy?: string
    descricao_imagem?: string
    status: 'valid' | 'error' | 'saved'
    message?: string
}

export default function IngestionPage() {
    const [mode, setMode] = useState<'manual' | 'batch' | 'pdf'>('manual')

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
                        <Upload className="h-8 w-8 text-emerald-600" />
                        Ingestão de Questões
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Adicione novas questões ao banco de dados.
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setMode('manual')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Manual
                    </button>
                    <button
                        onClick={() => setMode('batch')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'batch'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Em Lote (Texto)
                    </button>
                    <button
                        onClick={() => setMode('pdf')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'pdf'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        PDF (Inteligente)
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {mode === 'manual' ? (
                    <ManualIngestion key="manual" />
                ) : mode === 'batch' ? (
                    <BatchIngestion key="batch" />
                ) : (
                    <PDFIngestion key="pdf" />
                )}
            </AnimatePresence>
        </div>
    )
}

// --- Manual Ingestion Component ---
function ManualIngestion() {
    const [formData, setFormData] = useState({
        materia: '',
        comando: '',
        texto_associado: '',
        num_item: '',
        texto_item: '',
        gabarito: '',
        examen_ano: new Date().getFullYear(),
        examen_turno: ''
    })
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.texto_item || !formData.num_item) {
            setStatus('error')
            setMessage('Número do item e texto são obrigatórios')
            return
        }

        setSaving(true)
        setStatus('idle')

        try {
            // Generate embedding (optional for now)
            let embedding = null;
            try {
                if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
                    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
                    const textToEmbed = `${formData.materia}: ${formData.texto_associado} ${formData.comando} ${formData.texto_item}`
                    const embeddingResult = await genAI.getGenerativeModel({ model: 'text-embedding-004' })
                        .embedContent(textToEmbed)
                    embedding = embeddingResult.embedding.values
                }
            } catch (err) {
                console.warn("Embedding generation failed, saving without embedding", err)
            }

            // Insert into Supabase
            const { error } = await supabase
                .from('questions')
                .insert({
                    materia: formData.materia || 'Não especificada',
                    comando: formData.comando || null,
                    texto_associado: formData.texto_associado || null,
                    num_item: parseInt(formData.num_item),
                    texto_item: formData.texto_item,
                    gabarito: formData.gabarito.toUpperCase() || null,
                    anulado: formData.gabarito.toUpperCase() === 'X',
                    examen_ano: formData.examen_ano,
                    examen_turno: formData.examen_turno || null,
                    embedding: embedding
                })

            if (error) throw error

            setStatus('success')
            setMessage('Questão adicionada com sucesso!')

            // Reset form smart
            setFormData(prev => ({
                ...prev,
                num_item: String(parseInt(prev.num_item) + 1), // Auto increment
                texto_item: '',
                gabarito: '',
                // Keep comando and texto_associado
            }))

            setTimeout(() => setStatus('idle'), 3000)
        } catch (error: any) {
            setStatus('error')
            setMessage(error.message || 'Erro ao salvar questão')
        } finally {
            setSaving(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Nova Questão Individual</CardTitle>
                    <CardDescription>
                        Preencha os campos para adicionar uma única questão de forma precisa.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Metadata Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Matéria</label>
                                <select
                                    value={formData.materia}
                                    onChange={(e) => setFormData({ ...formData, materia: e.target.value })}
                                    className="w-full p-2 rounded-lg border bg-background"
                                >
                                    <option value="">Selecione...</option>
                                    {MATERIAS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ano</label>
                                <Input
                                    type="number"
                                    value={formData.examen_ano}
                                    onChange={(e) => setFormData({ ...formData, examen_ano: parseInt(e.target.value) })}
                                    placeholder="2025"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Turno</label>
                                <select
                                    value={formData.examen_turno}
                                    onChange={(e) => setFormData({ ...formData, examen_turno: e.target.value })}
                                    className="w-full p-2 rounded-lg border bg-background"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Manhã">Manhã</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                        </div>

                        {/* Reference Text */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Texto de Referência <span className="text-muted-foreground">(opcional - persistente)</span>
                            </label>
                            <textarea
                                value={formData.texto_associado}
                                onChange={(e) => setFormData({ ...formData, texto_associado: e.target.value })}
                                placeholder="Cole aqui o texto base para as questões (ex: 'Texto para os itens 10 a 15...')"
                                className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-y"
                            />
                        </div>

                        {/* Comando */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Comando <span className="text-muted-foreground">(opcional - persistente)</span>
                            </label>
                            <textarea
                                value={formData.comando}
                                onChange={(e) => setFormData({ ...formData, comando: e.target.value })}
                                placeholder="Ex: Acerca da Era Vargas, julgue os itens a seguir..."
                                className="w-full min-h-[60px] p-3 rounded-lg border bg-background resize-y"
                            />
                        </div>

                        {/* Item Number and Gabarito */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nº Item *</label>
                                <Input
                                    type="number"
                                    value={formData.num_item}
                                    onChange={(e) => setFormData({ ...formData, num_item: e.target.value })}
                                    placeholder="25"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Gabarito</label>
                                <select
                                    value={formData.gabarito}
                                    onChange={(e) => setFormData({ ...formData, gabarito: e.target.value })}
                                    className="w-full p-2 rounded-lg border bg-background"
                                >
                                    <option value="">-</option>
                                    <option value="C">C (Certo)</option>
                                    <option value="E">E (Errado)</option>
                                    <option value="X">X (Anulada)</option>
                                </select>
                            </div>
                        </div>

                        {/* Texto Item */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Texto do Item *</label>
                            <textarea
                                value={formData.texto_item}
                                onChange={(e) => setFormData({ ...formData, texto_item: e.target.value })}
                                placeholder="Digite o texto completo do item a ser julgado..."
                                className="w-full min-h-[100px] p-3 rounded-lg border bg-background resize-y"
                                required
                            />
                        </div>

                        {/* Feedback Area */}
                        <div className="flex items-center gap-4">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                {saving ? <Loader /> : <Save className="h-4 w-4" />}
                                Salvar e Próximo
                            </Button>

                            {status === 'success' && (
                                <span className="text-emerald-600 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-left-5">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Salvo!
                                </span>
                            )}
                            {status === 'error' && (
                                <span className="text-red-600 flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-left-5">
                                    <AlertCircle className="h-4 w-4" />
                                    {message}
                                </span>
                            )}
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}

// --- Batch Ingestion Component ---
function BatchIngestion() {
    const [rawText, setRawText] = useState('')
    const [parsedItems, setParsedItems] = useState<IngestionItem[]>([])
    const [step, setStep] = useState<'input' | 'review'>('input')
    const [isProcessing, setIsProcessing] = useState(false)

    // Default metadata for batch
    const [defaultMeta, setDefaultMeta] = useState({
        materia: '',
        texto_associado: '',
        examen_ano: new Date().getFullYear(),
        examen_turno: ''
    })

    const parseText = () => {
        setIsProcessing(true)

        // Simple heuristic parser
        // Assumes format: 
        // 1. Text ...
        // Gabarito: C

        const lines = rawText.split('\n');
        const items: IngestionItem[] = [];

        let currentItem: Partial<IngestionItem> = {};

        // Regex patterns
        const itemStartRegex = /^(\d+)[\.\)]\s*(.+)/; // Matches "1. Text" or "1) Text"
        const gabaritoRegex = /^(?:GABARITO|GAB|RESPOSTA):\s*([CEX])/i;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            const itemMatch = trimmed.match(itemStartRegex);
            const gabaritoMatch = trimmed.match(gabaritoRegex);

            if (itemMatch) {
                // If we were building an item, push it (incomplete if no gabarito yet, but we'll flag it)
                if (currentItem.num_item) {
                    items.push({
                        ...createItem(currentItem, defaultMeta),
                        status: validateItem(currentItem) ? 'valid' : 'error'
                    } as IngestionItem);
                }

                // Start new item
                currentItem = {
                    num_item: parseInt(itemMatch[1]),
                    texto_item: itemMatch[2],
                    comando: defaultMeta.materia ? `Questão de ${defaultMeta.materia}` : "Questão de Concurso" // Placeholder
                };
            } else if (gabaritoMatch) {
                if (currentItem.num_item) {
                    currentItem.gabarito = gabaritoMatch[1].toUpperCase();
                }
            } else {
                // Continuation of text
                if (currentItem.num_item && !currentItem.gabarito) {
                    currentItem.texto_item += " " + trimmed;
                }
            }
        });

        // Push last item
        if (currentItem.num_item) {
            items.push({
                ...createItem(currentItem, defaultMeta),
                status: validateItem(currentItem) ? 'valid' : 'error'
            } as IngestionItem);
        }

        setParsedItems(items);
        setStep('review');
        setIsProcessing(false);
    }

    const createItem = (partial: Partial<IngestionItem>, defaults: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        materia: defaults.materia || 'Geral',
        examen_ano: defaults.examen_ano,
        examen_turno: defaults.examen_turno,
        comando: partial.comando || '',
        texto_associado: defaults.texto_associado || '',
        num_item: partial.num_item || 0,
        texto_item: partial.texto_item || '',
        gabarito: partial.gabarito || '',
        status: 'valid'
    });

    const validateItem = (item: Partial<IngestionItem>) => {
        return !!(item.num_item && item.texto_item && item.gabarito);
    }

    const handleSaveAll = async () => {
        setIsProcessing(true);
        const validItems = parsedItems.filter(i => i.status === 'valid');

        for (const item of validItems) {
            try {
                const { error } = await supabase.from('questions').insert({
                    materia: item.materia,
                    comando: item.comando,
                    texto_associado: item.texto_associado,
                    num_item: item.num_item,
                    texto_item: item.texto_item,
                    gabarito: item.gabarito,
                    examen_ano: item.examen_ano,
                    examen_turno: item.examen_turno,
                    // No embedding for batch for speed/cost, can render later
                });

                setParsedItems(prev => prev.map(p =>
                    p.id === item.id
                        ? { ...p, status: error ? 'error' : 'saved', message: error?.message }
                        : p
                ));
            } catch (err) {
                console.error(err);
            }
        }
        setIsProcessing(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {step === 'input' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Configuração do Lote</CardTitle>
                        <CardDescription>Defina os metadados comuns para este grupo de questões.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Matéria Padrão</label>
                                <select
                                    value={defaultMeta.materia}
                                    onChange={(e) => setDefaultMeta({ ...defaultMeta, materia: e.target.value })}
                                    className="w-full p-2 rounded-lg border bg-background"
                                >
                                    <option value="">Selecione...</option>
                                    {MATERIAS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ano</label>
                                <Input type="number" value={defaultMeta.examen_ano} onChange={e => setDefaultMeta({ ...defaultMeta, examen_ano: parseInt(e.target.value) })} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Texto de Referência do Lote <span className="text-muted-foreground">(Opcional)</span>
                            </label>
                            <p className="text-xs text-muted-foreground">
                                Este texto será associado a TODAS as questões deste lote (ex: Texto comum para itens 20 a 30).
                            </p>
                            <textarea
                                value={defaultMeta.texto_associado}
                                onChange={(e) => setDefaultMeta({ ...defaultMeta, texto_associado: e.target.value })}
                                placeholder="Coloque o texto base aqui..."
                                className="w-full min-h-[120px] p-3 rounded-lg border bg-background resize-y"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cole o texto das questões</label>
                            <div className="text-xs text-muted-foreground mb-2">
                                Formato esperado:<br />
                                1. Texto da questão...<br />
                                Gabarito: C
                            </div>
                            <textarea
                                value={rawText}
                                onChange={(e) => setRawText(e.target.value)}
                                className="w-full min-h-[250px] p-4 font-mono text-sm border rounded-xl"
                                placeholder="1. O comando da questão...&#10;GABARITO: C&#10;&#10;2. A próxima questão...&#10;Gabarito: E"
                            />
                        </div>
                        <Button onClick={parseText} disabled={!rawText || isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                            {isProcessing ? 'Processando...' : 'Processar e Revisar'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 'review' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Revisar Itens ({parsedItems.length})</CardTitle>
                            <CardDescription>Verifique se os dados foram extraídos corretamente antes de salvar.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('input')}>Voltar e Editar</Button>
                            <Button
                                onClick={handleSaveAll}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Salvando...' : 'Confirmar e Inserir Tudo'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                            {parsedItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-lg border ${item.status === 'error' ? 'border-red-200 bg-red-50' :
                                        item.status === 'saved' ? 'border-emerald-200 bg-emerald-50' :
                                            'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.status === 'saved' ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {item.num_item}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex gap-4">
                                                <Input
                                                    value={item.texto_item}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, texto_item: newVal } : p))
                                                    }}
                                                    className="font-medium"
                                                />
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <select
                                                    value={item.gabarito}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, gabarito: newVal } : p))
                                                    }}
                                                    className="p-1 border rounded text-sm w-20"
                                                >
                                                    <option value="">?</option>
                                                    <option value="C">C</option>
                                                    <option value="E">E</option>
                                                    <option value="X">X</option>
                                                </select>
                                                <span className="text-xs text-gray-400">{item.materia} • {item.examen_ano}</span>
                                                {item.status === 'saved' && <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Salvo</span>}
                                                {item.status === 'error' && <span className="text-red-600 text-xs font-bold">Dados Inválidos ou Erro</span>}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-500 hover:bg-red-50"
                                            onClick={() => setParsedItems(prev => prev.filter(p => p.id !== item.id))}
                                        >
                                            <AlertCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    )
}

// --- PDF Ingestion Component ---
function PDFIngestion() {
    const [file, setFile] = useState<File | null>(null);
    const [gabaritoFile, setGabaritoFile] = useState<File | null>(null);
    const [parsedItems, setParsedItems] = useState<IngestionItem[]>([]);
    const [step, setStep] = useState<'upload' | 'review'>('upload');
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [isDraggingGabarito, setIsDraggingGabarito] = useState(false);

    // Default metadata
    const [defaultMeta, setDefaultMeta] = useState({
        materia: '',
        examen_ano: new Date().getFullYear(),
        examen_turno: ''
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleGabaritoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setGabaritoFile(e.target.files[0]);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the "data:application/pdf;base64," prefix
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const processPDF = async () => {
        if (!file) {
            alert("Por favor, selecione um arquivo PDF.");
            return;
        }
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            alert("Erro de Configuração: API Key do Gemini não encontrada ('NEXT_PUBLIC_GEMINI_API_KEY').\n\nSe você acabou de adicionar a chave no .env.local, REINICIE O SERVIDOR (pare e rode npm run dev novamente).");
            return;
        }

        setIsProcessing(true);

        try {
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

            // Define the schema for structured JSON output with dica_do_elphy
            const questionSchema = {
                type: SchemaType.ARRAY as const,
                items: {
                    type: SchemaType.OBJECT as const,
                    properties: {
                        num_item: { type: SchemaType.NUMBER as const, description: "Question number" },
                        materia: { type: SchemaType.STRING as const, description: "Subject: História do Brasil, História Mundial, Política Internacional, Geografia, Economia, Direito, Língua Portuguesa, Língua Inglesa, Outro" },
                        texto_item: { type: SchemaType.STRING as const, description: "The exact text of the question" },
                        texto_associado: { type: SchemaType.STRING as const, description: "Reference text that precedes this item, if any" },
                        comando: { type: SchemaType.STRING as const, description: "Command text like 'Julgue os itens...'" },
                        gabarito: { type: SchemaType.STRING as const, description: "Answer: C, E, or X" },
                        dica_do_elphy: { type: SchemaType.STRING as const, description: "Uma dica mnemônica curta em português (max 2 frases) para ajudar a lembrar o conceito-chave da questão. Seja criativo e pedagógico." },
                        descricao_imagem: { type: SchemaType.STRING as const, description: "Se a questão tiver imagem/gráfico/mapa associado, descreva-o detalhadamente para acessibilidade. Ex: 'Mapa da Europa mostrando...' Se não houver imagem, string vazia." }
                    },
                    required: ["num_item", "texto_item", "dica_do_elphy"]
                }
            };

            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash",
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: questionSchema
                }
            });

            // PHASE 1: Extract gabarito first (if provided) to inject inline
            let gabaritoMap: Record<number, string> = {};
            let gabaritoInlineText = "";

            if (gabaritoFile) {
                setStatusMessage('Fase 1/3: Extraindo gabarito...');
                const gabaritoBase64 = await convertFileToBase64(gabaritoFile);

                const gabaritoModel = genAI.getGenerativeModel({
                    model: "gemini-2.5-flash",
                    generationConfig: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: SchemaType.ARRAY as const,
                            items: {
                                type: SchemaType.OBJECT as const,
                                properties: {
                                    num: { type: SchemaType.NUMBER as const },
                                    resp: { type: SchemaType.STRING as const }
                                },
                                required: ["num", "resp"]
                            }
                        }
                    }
                });

                const gabaritoResult = await gabaritoModel.generateContent([
                    {
                        inlineData: {
                            data: gabaritoBase64,
                            mimeType: "application/pdf",
                        },
                    },
                    `Extract all answers from this answer key (gabarito) PDF.
                    Return a JSON array where each object has:
                    - "num": the question number
                    - "resp": the answer (C, E, or X for anulada)
                    
                    Example: [{"num": 1, "resp": "C"}, {"num": 2, "resp": "E"}]`
                ]);

                try {
                    const gabaritoData = JSON.parse(gabaritoResult.response.text());
                    gabaritoData.forEach((g: { num: number; resp: string }) => {
                        gabaritoMap[g.num] = g.resp.toUpperCase();
                    });

                    // Create inline text for injection (compressed format)
                    gabaritoInlineText = `\nGABARITO: ` +
                        gabaritoData.map((g: { num: number; resp: string }) => `${g.num}:${g.resp}`).join(' ');

                    console.log(`✓ Extracted ${gabaritoData.length} answers from gabarito`);
                } catch (e) {
                    console.warn("Could not parse gabarito, will extract from main PDF");
                }
            }

            // PHASE 2: Extract questions with inline gabarito and Elphy tips (STREAMING)
            setStatusMessage(gabaritoFile ? 'Fase 2/3: Extraindo questões em tempo real...' : 'Extraindo questões em tempo real...');
            const base64Data = await convertFileToBase64(file);

            // Optimized prompt with noise compression instructions
            const prompt = `Você é um parser de provas especializado. Analise o PDF e extraia TODAS as questões.

RUÍDO A IGNORAR (Prompt Compression):
- Headers: "CEBRASPE", "IRBr", "Edital:", números de página
- "Espaço livre", rodapés, marcas d'água
- Textos repetitivos de cabeçalho entre páginas

EXTRAIR PARA CADA QUESTÃO:
1. num_item: número da questão
2. materia: classifique entre (História do Brasil, História Mundial, Política Internacional, Geografia, Economia, Direito, Língua Portuguesa, Língua Inglesa, Outro)
3. texto_item: texto EXATO da questão (limpo de ruído)
4. texto_associado: Se houver "Texto para os itens X a Y", inclua o texto completo
5. comando: "Julgue os itens..." se aplicável
6. gabarito: use o gabarito abaixo
7. dica_do_elphy: crie uma dica mnemônica CURTA e CRIATIVA em português para ajudar o estudante a lembrar o conceito-chave. Seja pedagógico e use analogias quando possível.
8. descricao_imagem: Se houver imagem, descreva-a detalhadamente. Se não houver, deixe vazio.
${gabaritoInlineText}

IMPORTANTE: A dica_do_elphy deve ser curta (max 2 frases) e memorável. Exemplo: "Lembre: Heartland = coração da Eurásia. Quem controla o centro, controla o mundo!"

Retorne o JSON com todas as questões.`;

            const result = await model.generateContentStream([
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: "application/pdf",
                    },
                },
                prompt
            ]);

            let accumulatedText = '';
            let hasSwitchedToReview = false;

            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                accumulatedText += chunkText;

                // Visual feedback that something is happening
                if (accumulatedText.length % 50 === 0) { // Update status occasionally to avoid render spam
                    setStatusMessage(`Recebendo dados... (${accumulatedText.length} caracteres)`);
                }

                // Robust Partial JSON Parser
                // 1. Clean markdown
                let cleanStream = accumulatedText.replace(/```json/g, '').replace(/```/g, '').trim();

                // 2. Find all complete objects { ... } using regex
                // Improved Regex: matches { ... } non-greedy
                // We try to parse EVERY detected block like {...} to see if it's valid JSON
                const possibleObjects = cleanStream.match(/\{[\s\S]*?\}/g);

                if (possibleObjects) {
                    const parsedObjects = possibleObjects.map(s => {
                        try { return JSON.parse(s); } catch (e) { return null; }
                    }).filter(x => x && x.num_item); // Ensure it has at least a number

                    if (parsedObjects.length > 0) {
                        // Switch to review view immediately to show streaming progress
                        if (!hasSwitchedToReview) {
                            setStep('review');
                            hasSwitchedToReview = true;
                        }

                        // Merge gabarito and map to interface
                        const enrichedStreamItems = parsedObjects.map((item: any) => {
                            const gabFromMap = gabaritoMap[item.num_item];
                            return {
                                id: item.num_item.toString() + "_" + defaultMeta.examen_ano, // Stable ID for React reconciliation
                                materia: (defaultMeta.materia === 'Todas as Matérias' || !defaultMeta.materia) ? (item.materia || 'Geral') : defaultMeta.materia,
                                examen_ano: defaultMeta.examen_ano,
                                examen_turno: defaultMeta.examen_turno,
                                comando: item.comando || 'Julgue o item a seguir.',
                                texto_associado: item.texto_associado || '',
                                num_item: item.num_item || 0,
                                texto_item: item.texto_item || '',
                                gabarito: item.gabarito || gabFromMap || '',
                                dica_do_elphy: item.dica_do_elphy,
                                descricao_imagem: item.descricao_imagem,
                                status: 'valid'
                            } as IngestionItem;
                        });

                        setParsedItems(enrichedStreamItems);
                        setStatusMessage(`Extraindo... ${enrichedStreamItems.length} questões encontradas`);
                    }
                }
            }

            if (!hasSwitchedToReview) setStep('review');
        } catch (error: any) {
            console.error("PDF Processing Error:", error);
            setStatusMessage(`Erro: ${error.message}`);
        } finally {
            setIsProcessing(false);
            setStatusMessage('');
        }
    };

    const handleSaveAll = async () => {
        setIsProcessing(true);
        const validItems = parsedItems.filter(i => i.status === 'valid');

        for (const item of validItems) {
            try {
                // Generate embedding for PDF items too
                let embedding = null;
                // Optional: we can skip embedding for speed or implement it

                const { error } = await supabase.from('questions').insert({
                    materia: item.materia,
                    comando: item.comando,
                    texto_associado: item.texto_associado,
                    num_item: item.num_item,
                    texto_item: item.texto_item,
                    gabarito: item.gabarito.toUpperCase(),
                    examen_ano: item.examen_ano,
                    examen_turno: item.examen_turno,
                    dica_do_elphy: item.dica_do_elphy,
                    descricao_imagem: item.descricao_imagem,
                });

                setParsedItems(prev => prev.map(p =>
                    p.id === item.id
                        ? { ...p, status: error ? 'error' : 'saved', message: error?.message }
                        : p
                ));
            } catch (err) {
                console.error(err);
            }
        }
        setIsProcessing(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
        >
            {step === 'upload' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload de Prova em PDF</CardTitle>
                        <CardDescription>A IA analisará o PDF visualmente para extrair questões e textos associados.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Matéria Padrão</label>
                                <select
                                    value={defaultMeta.materia}
                                    onChange={(e) => setDefaultMeta({ ...defaultMeta, materia: e.target.value })}
                                    className="w-full p-2 rounded-lg border bg-background"
                                >
                                    <option value="">Selecione...</option>
                                    {MATERIAS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Ano</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={defaultMeta.examen_ano}
                                        onChange={e => setDefaultMeta({ ...defaultMeta, examen_ano: parseInt(e.target.value) })}
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        title={`Apagar todas as questões de ${defaultMeta.examen_ano}`}
                                        onClick={async () => {
                                            if (!confirm(`TEM CERTEZA? Isso apagará TODAS as questões do ano ${defaultMeta.examen_ano} do banco de dados.`)) return;

                                            setIsProcessing(true);
                                            try {
                                                const { error } = await supabase.from('questions').delete().eq('examen_ano', defaultMeta.examen_ano);
                                                if (error) throw error;
                                                setStatusMessage(`Dados de ${defaultMeta.examen_ano} limpos com sucesso!`);
                                            } catch (e: any) {
                                                setStatusMessage(`Erro: ${e.message}`);
                                            } finally {
                                                setIsProcessing(false);
                                                // Clear status after 3s
                                                setTimeout(() => setStatusMessage(''), 3000);
                                            }
                                        }}
                                        disabled={isProcessing}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Turno</label>
                                <select
                                    value={defaultMeta.examen_turno}
                                    onChange={(e) => setDefaultMeta({ ...defaultMeta, examen_turno: e.target.value })}
                                    className="w-full p-2 rounded-lg border bg-background"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="Manhã">Manhã</option>
                                    <option value="Tarde">Tarde</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* PDF Prova */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">1. Arquivo da Prova</label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer h-48
                                        ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
                                    onClick={() => document.getElementById('pdf-upload')?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDragging(true);
                                    }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDragging(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            setFile(e.dataTransfer.files[0]);
                                        }
                                    }}
                                >
                                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="text-center">
                                        {file ? (
                                            <p className="text-sm font-semibold text-blue-700">{file.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-gray-700">Prova (Questões)</p>
                                                <p className="text-xs text-gray-500">Clique ou arraste o arquivo aqui</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="pdf-upload"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>

                            {/* PDF Gabarito */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">2. Gabarito (Opcional)</label>
                                <div
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-4 transition-colors cursor-pointer h-48
                                        ${isDraggingGabarito ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-300/50 bg-white hover:bg-emerald-50'}`}
                                    onClick={() => document.getElementById('gabarito-upload')?.click()}
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        setIsDraggingGabarito(true);
                                    }}
                                    onDragLeave={() => setIsDraggingGabarito(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setIsDraggingGabarito(false);
                                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                            setGabaritoFile(e.dataTransfer.files[0]);
                                        }
                                    }}
                                >
                                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div className="text-center">
                                        {gabaritoFile ? (
                                            <p className="text-sm font-semibold text-emerald-700">{gabaritoFile.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm font-semibold text-gray-700">Gabarito (Respostas)</p>
                                                <p className="text-xs text-gray-500">Separado do PDF da prova</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="gabarito-upload"
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleGabaritoChange}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>

                        {statusMessage && (
                            <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2 animate-pulse">
                                <Loader /> {statusMessage}
                            </div>
                        )}

                        <Button
                            onClick={processPDF}
                            disabled={!file || isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg"
                        >
                            {isProcessing ? 'Processando com IA...' : 'Analisar e Extrair'}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {step === 'review' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Revisão Inteligente ({parsedItems.length} Itens)</CardTitle>
                            <CardDescription>Confira se o texto associado foi extraído para os itens corretos.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setStep('upload')}>Carregar Outro</Button>
                            <Button
                                onClick={handleSaveAll}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processando...' : 'Salvar Tudo no Banco'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                            {parsedItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-lg border ${item.status === 'error' ? 'border-red-200 bg-red-50' :
                                        item.status === 'saved' ? 'border-emerald-200 bg-emerald-50' :
                                            'border-gray-200 bg-white'
                                        }`}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-2 border-b pb-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.status === 'saved' ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                                {item.num_item}
                                            </div>
                                            <span className="font-semibold text-gray-700">Questão {item.num_item}</span>

                                            {/* Gabarito Editor */}
                                            <div className="ml-auto flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Gabarito:</span>
                                                <select
                                                    value={item.gabarito}
                                                    onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, gabarito: newVal } : p))
                                                    }}
                                                    className="p-1 border rounded text-sm w-16 font-bold"
                                                >
                                                    <option value="">?</option>
                                                    <option value="C">C</option>
                                                    <option value="E">E</option>
                                                    <option value="X">X</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Reference Text Review */}
                                        {item.texto_associado && (
                                            <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                                                <div className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">
                                                    <FileText className="w-3 h-3" /> TEXTO ASSOCIADO
                                                </div>
                                                <textarea
                                                    value={item.texto_associado}
                                                    onChange={(e) => {
                                                        setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, texto_associado: e.target.value } : p))
                                                    }}
                                                    className="w-full text-xs text-gray-600 bg-transparent resize-y min-h-[60px] border-none focus:ring-0"
                                                />
                                            </div>
                                        )}

                                        {/* Question Text */}
                                        <textarea
                                            value={item.texto_item}
                                            onChange={(e) => {
                                                setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, texto_item: e.target.value } : p))
                                            }}
                                            className="w-full p-2 border rounded-md text-sm font-medium"
                                        />

                                        {/* Elphy Tip */}
                                        <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
                                            <div className="text-xs font-bold text-purple-600 mb-1 flex items-center gap-1">
                                                <span>🐘 Dica do Elphy:</span>
                                            </div>
                                            <textarea
                                                value={item.dica_do_elphy || ''}
                                                onChange={(e) => {
                                                    setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, dica_do_elphy: e.target.value } : p))
                                                }}
                                                placeholder="Dica mnemônica..."
                                                className="w-full text-xs text-gray-600 bg-transparent resize-y min-h-[40px] border-none focus:ring-0"
                                            />
                                        </div>

                                        {/* Image Description (if exists) */}
                                        {item.descricao_imagem && (
                                            <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                                                <div className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1">
                                                    <span>🖼️ Descrição da Imagem (Acessibilidade):</span>
                                                </div>
                                                <textarea
                                                    value={item.descricao_imagem}
                                                    onChange={(e) => {
                                                        setParsedItems(prev => prev.map(p => p.id === item.id ? { ...p, descricao_imagem: e.target.value } : p))
                                                    }}
                                                    className="w-full text-xs text-gray-600 bg-transparent resize-y min-h-[40px] border-none focus:ring-0"
                                                />
                                            </div>
                                        )}

                                        {/* Status Feedback */}
                                        {item.status === 'saved' && <span className="text-emerald-600 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Salvo no Banco</span>}
                                        {item.status === 'error' && <span className="text-red-600 text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Erro ao Salvar</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </motion.div>
    )
}

function Loader() {
    return <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}
