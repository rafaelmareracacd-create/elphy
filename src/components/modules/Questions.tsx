'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Filter, BookOpen } from 'lucide-react'

interface Question {
    id: string
    materia: string
    comando: string | null
    num_item: number
    texto_item: string
    gabarito: string | null
    anulado: boolean
    examen_ano: number
    examen_turno: string | null
}

export default function QuestionsModule() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterMateria, setFilterMateria] = useState<string>('all')
    const [materias, setMaterias] = useState<string[]>([])

    useEffect(() => {
        loadQuestions()
    }, [])

    const loadQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('num_item', { ascending: true })

            if (error) throw error

            setQuestions(data || [])

            // Extract unique materias
            const uniqueMaterias = Array.from(new Set(data?.map(q => q.materia) || []))
            setMaterias(uniqueMaterias)
        } catch (error) {
            console.error('Error loading questions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.texto_item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.comando?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMateria = filterMateria === 'all' || q.materia === filterMateria
        return matchesSearch && matchesMateria
    })

    if (loading) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">Carregando questões...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <BookOpen className="h-8 w-8" />
                    Banco de Questões
                </h2>
                <p className="text-muted-foreground mt-2">
                    {questions.length} questões disponíveis
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar questões..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="w-64">
                            <select
                                value={filterMateria}
                                onChange={(e) => setFilterMateria(e.target.value)}
                                className="w-full p-2 rounded-lg border bg-background"
                            >
                                <option value="all">Todas as Matérias</option>
                                {materias.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions List */}
            <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground text-center">
                                Nenhuma questão encontrada
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredQuestions.map((question) => (
                        <Card key={question.id} className="hover:shadow-md transition">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-sm font-semibold text-muted-foreground">
                                                Item {question.num_item}
                                            </span>
                                            <span className="text-sm px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                {question.materia}
                                            </span>
                                            {question.examen_turno && (
                                                <span className="text-xs text-muted-foreground">
                                                    {question.examen_ano} • {question.examen_turno}
                                                </span>
                                            )}
                                        </div>
                                        {question.comando && (
                                            <CardDescription className="text-sm mb-2">
                                                {question.comando}
                                            </CardDescription>
                                        )}
                                    </div>
                                    {question.gabarito && (
                                        <div className={`px-4 py-2 rounded-full font-bold ${question.gabarito === 'C'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : question.gabarito === 'E'
                                                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                                            }`}>
                                            {question.gabarito}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base leading-relaxed">
                                    {question.texto_item}
                                </p>
                                {question.anulado && (
                                    <div className="mt-3 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded text-sm font-medium">
                                        ⚠️ Questão Anulada
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Summary */}
            <div className="text-sm text-muted-foreground text-center">
                Mostrando {filteredQuestions.length} de {questions.length} questões
            </div>
        </div>
    )
}
