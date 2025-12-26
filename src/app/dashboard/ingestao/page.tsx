'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, Save, CheckCircle2, AlertCircle } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const MATERIAS = [
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

export default function ManualIngestionPage() {
    const [formData, setFormData] = useState({
        materia: '',
        comando: '',
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
            // Generate embedding
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
            const textToEmbed = `${formData.materia}: ${formData.comando} ${formData.texto_item}`
            const embeddingResult = await genAI.getGenerativeModel({ model: 'text-embedding-004' })
                .embedContent(textToEmbed)
            const embedding = embeddingResult.embedding.values

            // Insert into Supabase
            const { error } = await supabase
                .from('questions')
                .insert({
                    materia: formData.materia || 'Não especificada',
                    comando: formData.comando || null,
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

            // Reset form
            setFormData({
                materia: formData.materia, // Keep materia selected
                comando: formData.comando, // Keep comando for same group
                num_item: String(parseInt(formData.num_item) + 1), // Auto increment
                texto_item: '',
                gabarito: '',
                examen_ano: formData.examen_ano,
                examen_turno: formData.examen_turno
            })

            setTimeout(() => setStatus('idle'), 3000)
        } catch (error: any) {
            setStatus('error')
            setMessage(error.message || 'Erro ao salvar questão')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Plus className="h-8 w-8" />
                    Ingestão Manual
                </h1>
                <p className="text-muted-foreground mt-2">
                    Adicione questões individualmente ao banco de dados
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Nova Questão</CardTitle>
                    <CardDescription>
                        Preencha os campos abaixo para adicionar uma questão manualmente
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

                        {/* Comando */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Comando <span className="text-muted-foreground">(opcional)</span>
                            </label>
                            <textarea
                                value={formData.comando}
                                onChange={(e) => setFormData({ ...formData, comando: e.target.value })}
                                placeholder="Ex: Acerca da Era Vargas, julgue os itens a seguir..."
                                className="w-full min-h-[80px] p-3 rounded-lg border bg-background resize-y"
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
                                className="w-full min-h-[150px] p-3 rounded-lg border bg-background resize-y"
                                required
                            />
                        </div>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="bg-green-500/10 text-green-600 p-4 rounded-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5" />
                                {message}
                            </div>
                        )}

                        {status === 'error' && (
                            <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                {message}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1 gap-2"
                            >
                                {saving ? (
                                    <>Salvando...</>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Salvar e Continuar
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">💡 Dica</h3>
                <p className="text-sm text-muted-foreground">
                    Após salvar, o formulário mantém a matéria e o comando, e incrementa o número do item automaticamente para facilitar a entrada sequencial.
                </p>
            </div>
        </div>
    )
}
