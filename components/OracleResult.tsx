/**
 * OracleResult — Vista de resultados del Oráculo.
 *
 * Responsabilidades:
 *  1. Resolver las preguntas del banco estático (modo clásico)
 *  2. Delegar la llamada AI al hook useOracleAI (modo profundo)
 *  3. Renderizar cards, loading state, error state y acciones de exportación
 *
 * Analogía: este componente es el "tablero de operaciones" —
 * el hook AI es el agente que consigue la inteligencia;
 * el componente solo la presenta.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { FormData, QuestionTemplate } from '../types';
import { ORACLE_BANK, METHOD_IMAGES, oracleKey, COLOR_TOKEN_MAP, DEFAULT_BORDER_CLASS, DEFAULT_TEXT_CLASS } from '../constants';
import { useOracleAI } from '../hooks/useOracleAI';
import { Button } from './Button';
import { Mail, RefreshCw, Copy, Check, BrainCircuit, Loader2, AlertTriangle } from 'lucide-react';

interface OracleResultProps {
  data:    FormData;
  onReset: () => void;
}

// ─── Helper: resuelve borderClass y textClass desde el mapa centralizado ──────
// FIX: reemplaza parseBorderClass / parseTextClass (string splitting frágil)
// con un lookup en COLOR_TOKEN_MAP. Cae en los defaults si la clave no existe.
const resolveColorClasses = (color?: string): { borderClass: string; textClass: string } => {
  if (!color) return { borderClass: DEFAULT_BORDER_CLASS, textClass: DEFAULT_TEXT_CLASS };

  // El color puede ser una sola clase ("border-red-500") o múltiples clases
  // ("border-gray-200 text-gray-200"). Normalizamos a la clase de borde.
  const borderCandidate = color.split(' ').find(c => c.startsWith('border-')) ?? color;

  if (COLOR_TOKEN_MAP[borderCandidate]) {
    return COLOR_TOKEN_MAP[borderCandidate];
  }

  // Fallback: deducción directa (cubre colores arbitrarios del banco)
  return {
    borderClass: borderCandidate,
    textClass: borderCandidate.replace('border-', 'text-'),
  };
};

// ─── Subcomponente: card individual de pregunta ───────────────────────────────
const QuestionCard: React.FC<{ question: QuestionTemplate; index: number }> = ({ question, index }) => {
  const { borderClass, textClass } = resolveColorClasses(question.color);

  return (
    <div
      className={`bg-chala-darkgray p-6 rounded-lg border-l-4 shadow-lg hover:bg-black transition-colors duration-300 ${borderClass}`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 opacity-80 ${textClass}`}>
        {question.heading}
      </h3>
      <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-100 whitespace-pre-wrap">
        {question.text ?? question.template}
      </p>
    </div>
  );
};

// ─── Subcomponente: pantalla de carga AI ──────────────────────────────────────
const LoadingScreen: React.FC<{ elapsed: number }> = ({ elapsed }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in space-y-6">
    <div className="relative">
      <div className="absolute inset-0 bg-chala-magenta/20 blur-xl rounded-full animate-pulse-slow" />
      <Loader2 className="w-16 h-16 text-chala-magenta animate-spin relative z-10" />
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-2xl font-black text-white uppercase tracking-widest">
        Gemini 2.0 Flash
      </h3>
      <p className="text-chala-green font-mono text-sm">Análisis AI Profundo en curso...</p>
      <p className="text-gray-500 text-xs">Tiempo de cómputo: {elapsed.toFixed(1)}s</p>
    </div>
    {/* Barra de progreso — shimmer definido en index.html */}
    <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-chala-magenta to-chala-gold shimmer-bar" />
    </div>
  </div>
);

// ─── Subcomponente: pantalla de error ─────────────────────────────────────────
const ErrorScreen: React.FC<{ message: string; onRetry: () => void; onReset: () => void }> = ({
  message, onRetry, onReset
}) => (
  <div className="text-center py-12 space-y-4">
    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
    <p className="text-white">{message}</p>
    <div className="flex gap-3 justify-center">
      <Button onClick={onRetry} variant="primary">Reintentar</Button>
      <Button onClick={onReset} variant="outline">Volver al Inicio</Button>
    </div>
  </div>
);


// ─── Subcomponente: CTA de monetización ───────────────────────────────────────
const UpgradeCTA: React.FC<{ method: string; context: string }> = ({ method, context }) => {
  const STRIPE_URL = 'https://buy.stripe.com/cNi8wP0DF8ds2Pu6uCgfu01';
  const clientRef = `oraculo-${method}-${context}`.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 60);
  const href = `${STRIPE_URL}?client_reference_id=${encodeURIComponent(clientRef)}`;

  const handleClick = () => {
    const w = window as unknown as { dataLayer?: Array<Record<string, unknown>> };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({
      event: 'oraculo_cta_click',
      cta_location: 'oracle_result',
      method,
      context,
      source_subdomain: 'oraculo',
      value: 27,
      currency: 'USD',
    });
  };

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-chala-gold bg-gradient-to-br from-chala-darkgray to-black p-8 text-center my-8">
      <div className="absolute inset-0 bg-chala-gold/5 blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="relative z-10 space-y-4">
        <p className="text-chala-gold text-xs font-black uppercase tracking-[0.3em]">
          Análisis Completo
        </p>
        <h3 className="text-2xl md:text-3xl font-black text-white leading-tight">
          ¿Quieres tu Mapa SRAP con acompañamiento?
        </h3>
        <p className="text-gray-300 max-w-lg mx-auto">
          Sesión 1:1 de 90 minutos. Diagnosticamos tu arquetipo, calibramos tu estrategia y trazamos el plan de acción.
        </p>
        <div className="flex items-center justify-center gap-3 py-2">
          <span className="text-4xl font-black text-white">$27</span>
          <span className="text-sm text-gray-400">USD</span>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="inline-block w-full md:w-auto bg-chala-gold hover:bg-yellow-400 text-black font-black px-8 py-4 rounded-xl transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(255,179,0,0.25)]"
        >
          RESERVAR SESIÓN →
        </a>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">
          Pago seguro con Stripe · Acceso inmediato
        </p>
      </div>
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────────
export const OracleResult: React.FC<OracleResultProps> = ({ data, onReset }) => {
  const { method, context, situation, useAI } = data;

  const activeSituation = situation.trim() || context;

  const [copied, setCopied] = useState(false);

  const {
    questions: aiQuestions,
    loading,
    error,
    elapsedTime,
    retry,
  } = useOracleAI({
    method,
    context,
    situation: activeSituation,
    enabled: useAI,
  });

  const questions = useMemo((): QuestionTemplate[] => {
    if (useAI && aiQuestions) return aiQuestions;

    const key       = oracleKey(method, context);
    const templates = ORACLE_BANK[key] ?? ORACLE_BANK[method] ?? [];

    return templates.map(t => ({
      ...t,
      text: t.template.replace(/\[situacion\]/g, activeSituation),
    }));
  }, [method, context, activeSituation, useAI, aiQuestions]);

  // ─── Exportar por email ──────────────────────────────────────────────────────
  const handleEmail = useCallback(() => {
    const subject     = encodeURIComponent(`Mis Resultados Chalamandra: ${method}`);
    const body        = encodeURIComponent(
      `Oráculo Chalamandra — Diagnóstico\n\n` +
      `Método: ${method} | Personaje: ${context}\n` +
      `Situación: "${activeSituation}"\n\n` +
      questions.map(q => `[${q.heading}]\n${q.text ?? q.template}`).join('\n\n') +
      `\n\n---\nGenerado por Oráculo Chalamandra.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }, [method, context, activeSituation, questions]);

  // ─── Copiar al portapapeles con feedback visual ───────────────────────────────
  const handleCopy = useCallback(async () => {
    const text = questions
      .map(q => `${q.heading}:\n${q.text ?? q.template}`)
      .join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [questions]);

  if (loading) return <LoadingScreen elapsed={elapsedTime} />;
  if (error)   return <ErrorScreen message={error} onRetry={retry} onReset={onReset} />;

  const methodImage = METHOD_IMAGES[method];

  return (
    <div className="animate-slide-up w-full max-w-3xl mx-auto">

      {/* Cabecera del diagnóstico */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-widest ${
            useAI
              ? 'border-chala-magenta text-white bg-chala-magenta/20'
              : 'border-gray-500 text-gray-500'
          }`}>
            {useAI && <BrainCircuit className="w-3 h-3" />}
            {useAI ? 'Análisis AI Profundo' : 'Modo Clásico'}
          </div>
        </div>

        {/* Imagen ilustrativa del método (si existe) */}
        {methodImage && (
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-chala-magenta/15 blur-2xl rounded-full scale-110" />
              <img
                src={methodImage}
                alt={`Ilustración: ${method}`}
                loading="lazy"
                width="176"
                height="176"
                className="relative w-32 h-32 md:w-44 md:h-44 object-contain drop-shadow-[0_0_18px_rgba(213,0,108,0.3)]"
              />
            </div>
          </div>
        )}

        <h2 className="text-3xl font-black text-white mb-1">Diagnóstico: {method}</h2>
        <p className="text-chala-gold text-sm font-bold uppercase tracking-widest mb-2">{context}</p>
        <p className="text-gray-400 italic">"{activeSituation}"</p>
      </div>

      {/* Cards de preguntas */}
      <div className="grid gap-4 mb-8">
        {questions.map((q, idx) => (
          <QuestionCard key={idx} question={q} index={idx} />
        ))}
      </div>

      {/* Ritual sugerido */}
      <div className="bg-black/40 border border-gray-800 p-6 rounded-lg mb-8 text-center">
        <p className="text-chala-gold text-sm font-mono mb-2">⚡ RITUAL SUGERIDO ⚡</p>
        <p className="text-gray-400">
          Respira profundo (SRAP). Lee en voz alta. Ejecuta la primera acción en 72 horas.
        </p>
      </div>

      {/* CTA de monetización */}
      <UpgradeCTA method={method} context={context} />

      {/* Acciones de exportación */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleEmail}
          variant="secondary"
          className="flex items-center justify-center gap-2"
        >
          <Mail className="w-4 h-4" /> Guardar en Email
        </Button>

        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex items-center justify-center gap-2 min-w-[160px]"
        >
          {copied
            ? <><Check className="w-4 h-4 text-chala-green" /> Copiado</>
            : <><Copy className="w-4 h-4" /> Copiar Texto</>
          }
        </Button>

        <Button
          onClick={onReset}
          variant="outline"
          className="flex items-center justify-center gap-2 !border-gray-600 !text-gray-400 hover:!text-white hover:!border-white"
        >
          <RefreshCw className="w-4 h-4" /> Nueva Consulta
        </Button>
      </div>
    </div>
  );
};
