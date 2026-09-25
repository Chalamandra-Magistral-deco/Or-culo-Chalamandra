import { useState } from 'react';
import type { ThinkingMethod, ContextOption } from '@/lib/types';

interface QuestionsPanelProps {
  questions: string[];
  source?: 'gemini' | 'fallback';
  method?: ThinkingMethod | '';
  context?: ContextOption | '';
}

// El tipo para el estado de guardado de cada pregunta
type SaveStatus = 'idle' | 'saving' | 'saved';

const BookmarkIcon = ({ status }: { status: SaveStatus }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill={status === 'saved' ? 'currentColor' : 'none'} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="bookmark-icon"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
  </svg>
);

export function QuestionsPanel(props: QuestionsPanelProps) {
  const { questions, source = 'gemini', method = '', context = '' } = props;
  // Usamos un Map para un estado más rico por pregunta
  const [questionStatus, setQuestionStatus] = useState<Map<string, SaveStatus>>(new Map());

  const getStatus = (question: string): SaveStatus => {
    return questionStatus.get(question) || 'idle';
  }

  const handleSaveQuestion = async (question: string) => {
    if (!method || !context || getStatus(question) === 'saving') return;

    const currentStatus = getStatus(question);
    const isSaved = currentStatus === 'saved';

    // 1. Actualización optimista de la UI a 'saving'
    setQuestionStatus(prev => new Map(prev).set(question, 'saving'));

    try {
      // 2. Enviar feedback al backend
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, method, context, saved: !isSaved }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      // 3. Actualización final de la UI a 'saved'
      setQuestionStatus(prev => new Map(prev).set(question, isSaved ? 'idle' : 'saved'));

    } catch (error) {
      console.error("Failed to save feedback:", error);
      // 4. Si la API falla, revertir al estado original
      setQuestionStatus(prev => new Map(prev).set(question, currentStatus));
      // Opcional: mostrar un mensaje de error al usuario
    }
  };

  if (!questions.length) return null;

  const getButtonText = (status: SaveStatus) => {
    switch (status) {
      case 'saving': return 'Guardando...';
      case 'saved': return 'Guardada ✔';
      default: return 'Guardar';
    }
  }

  return (
    <section className="card">
      <h2>Tus preguntas personalizadas</h2>
      <div className="questionsBlock">
        <p className="hatTitle">
          {source === 'fallback' ? 'Decodificación estratégica (modo respaldo)' : 'Decodificación estratégica'}
        </p>
        <ul className="questionsList">
          {questions.map((question) => {
            const status = getStatus(question);
            return (
              <li key={question} className={status === 'saved' ? 'saved' : ''}>
                <span>{question}</span>
                <button 
                  onClick={() => handleSaveQuestion(question)} 
                  className="save-btn" 
                  disabled={status === 'saving'}
                  title={status === 'saved' ? 'Quitar marca' : 'Marcar como valiosa'}
                >
                  <BookmarkIcon status={status} />
                  <span>{getButtonText(status)}</span>
                </button>
              </li>
            )}
          )}
        </ul>
      </div>
    </section>
  );
}
