'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Save, CheckCircle2, Sparkles, Loader2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface Question {
  id: string
  materia: string
  comando: string | null
  texto_associado: string | null
  num_item: number
  texto_item: string
  gabarito: string | null
  anulado: boolean
  examen_ano: number
  examen_turno: string | null
  super_comment: string | null
  comment_updated_at: string | null
}

export default function ComentariosPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [filter, setFilter] = useState<'all' | 'commented' | 'uncommented'>('all')
  const [generating, setGenerating] = useState(false)

  // Generate AI Super Comment
  const generateAIComment = async () => {
    if (!questions[currentIndex]) return
    if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      alert('API Key do Gemini não configurada.')
      return
    }

    setGenerating(true)
    try {
      const q = questions[currentIndex]
      const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const gabaritoExplicado = q.gabarito === 'C' ? 'CERTO' : q.gabarito === 'E' ? 'ERRADO' : 'ANULADO'

      const prompt = `Você é um professor especialista em concursos públicos brasileiros, particularmente do CACD (Concurso de Admissão à Carreira de Diplomata).

Sua tarefa é criar um **SUPER COMENTÁRIO** para a questão abaixo. Este comentário deve ser:
1. **Didático e profundo**: Explique o raciocínio completo, não apenas "porque está certo/errado"
2. **Contextualizado**: Relacione com o tema maior, legislação, doutrina ou fatos históricos relevantes
3. **Estratégico**: Dê dicas de como identificar questões similares no futuro
4. **Bem estruturado**: Use parágrafos curtos e linguagem clara

---
**DADOS DA QUESTÃO:**
- Matéria: ${q.materia}
- Ano: ${q.examen_ano}
${q.comando ? `- Comando: ${q.comando}` : ''}
${q.texto_associado ? `- Texto de Referência: "${q.texto_associado}"` : ''}
- Assertiva: "${q.texto_item}"
- Gabarito Oficial: **${gabaritoExplicado}**
---

${q.texto_associado ? 'IMPORTANTE: Use o Texto de Referência acima para contextualizar sua explicação. A assertiva deve ser analisada à luz desse texto.' : ''}

Agora, escreva o super comentário em português brasileiro. Comece explicando por que a assertiva está ${gabaritoExplicado.toLowerCase()}, depois contextualize e finalize com uma dica estratégica.`

      const result = await model.generateContent(prompt)
      const generatedComment = result.response.text()

      setComment(generatedComment)
      setSaved(false)
    } catch (error: any) {
      console.error('Error generating AI comment:', error)
      alert(`Erro ao gerar comentário: ${error.message}`)
    } finally {
      setGenerating(false)
    }
  }

  // Load questions from Supabase
  useEffect(() => {
    loadQuestions()
  }, [filter])

  // Update comment when current question changes
  useEffect(() => {
    if (questions[currentIndex]) {
      setComment(questions[currentIndex].super_comment || '')
      setSaved(false)
    }
  }, [currentIndex, questions])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        saveComment()
        return
      }

      // Only handle navigation if not focused on textarea
      if (document.activeElement?.tagName === 'TEXTAREA') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPrevious()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, questions.length, comment])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('questions')
        .select('*')
        .order('num_item', { ascending: true })

      if (filter === 'commented') {
        query = query.not('super_comment', 'is', null)
      } else if (filter === 'uncommented') {
        query = query.is('super_comment', null)
      }

      const { data, error } = await query

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error loading questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveComment = async () => {
    if (!questions[currentIndex]) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          super_comment: comment || null,
          comment_updated_at: new Date().toISOString()
        })
        .eq('id', questions[currentIndex].id)

      if (error) throw error

      // Update local state
      const updatedQuestions = [...questions]
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        super_comment: comment || null,
        comment_updated_at: new Date().toISOString()
      }
      setQuestions(updatedQuestions)

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving comment:', error)
    } finally {
      setSaving(false)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Carregando questões...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Super Comentários</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">
              {filter === 'commented'
                ? 'Nenhuma questão com comentário encontrada.'
                : filter === 'uncommented'
                  ? 'Todas as questões já possuem comentários!'
                  : 'Nenhuma questão encontrada no banco de dados.'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQuestion = questions[currentIndex]

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Super Comentários</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {questions.filter(q => q.super_comment).length} de {questions.length} comentadas
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas
          </Button>
          <Button
            variant={filter === 'uncommented' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('uncommented')}
          >
            Sem Comentário
          </Button>
          <Button
            variant={filter === 'commented' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('commented')}
          >
            Com Comentário
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Item {currentIndex + 1} de {questions.length}</span>
          <span className="text-gray-400">← → para navegar • Ctrl+S para salvar</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">
                Item {currentQuestion.num_item}
              </CardTitle>
              <CardDescription>
                {currentQuestion.materia} • {currentQuestion.examen_ano}
                {currentQuestion.examen_turno && ` • ${currentQuestion.examen_turno}`}
                {currentQuestion.anulado && ' • ANULADA'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${currentQuestion.gabarito === 'C'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : currentQuestion.gabarito === 'E'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                {currentQuestion.gabarito || 'N/A'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestion.comando && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">Comando:</p>
              <p className="text-sm">{currentQuestion.comando}</p>
            </div>
          )}

          {currentQuestion.texto_associado && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-400 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">📖 Texto Associado:</p>
              <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed whitespace-pre-line">{currentQuestion.texto_associado}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Assertiva:</p>
            <p className="text-base leading-relaxed">{currentQuestion.texto_item}</p>
          </div>
        </CardContent>
      </Card>

      {/* Comment Editor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Super Comentário</CardTitle>
          <CardDescription>
            Escreva seu comentário curado para esta questão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value)
              setSaved(false)
            }}
            placeholder="Digite seu super comentário aqui..."
            className="w-full min-h-[200px] p-4 rounded-lg border bg-background resize-y focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {currentQuestion.comment_updated_at && (
                <span>
                  Última atualização: {new Date(currentQuestion.comment_updated_at).toLocaleString('pt-BR')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* AI Generation Button */}
              <Button
                onClick={generateAIComment}
                disabled={generating}
                variant="outline"
                className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar com IA
                  </>
                )}
              </Button>

              {/* Save Button */}
              <Button
                onClick={saveComment}
                disabled={saving}
                className="gap-2"
              >
                {saved ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Salvo!
                  </>
                ) : saving ? (
                  'Salvando...'
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentIndex + 1} de {questions.length}
        </span>

        <Button
          variant="outline"
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className="gap-2"
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
