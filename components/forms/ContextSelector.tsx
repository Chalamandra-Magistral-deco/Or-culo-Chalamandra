import type { ContextOption } from '../../lib/types';

export const CONTEXT_OPTIONS: ContextOption[] = [
  'Decisión laboral',
  'Relación de pareja',
  'Parentalidad',
  'Ciberseguridad',
  'Cliente freelancer',
  'Autocuidado/bienestar',
];

interface ContextSelectorProps {
  value: ContextOption;
  onChange: (context: ContextOption) => void;
}

export function ContextSelector({ value, onChange }: ContextSelectorProps) {
  return (
    <div className="w-full max-w-md">
      <label htmlFor="context-selector" className="block text-lg font-medium text-gray-300 mb-2">
        Contexto de aplicación
      </label>
      <select id="context-selector" value={value} onChange={(event) => onChange(event.target.value as ContextOption)} className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md">
        {CONTEXT_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

export default ContextSelector;
