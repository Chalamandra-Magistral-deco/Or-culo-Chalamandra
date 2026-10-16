import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-8 mt-12 border-t border-gray-800 text-center">
      <p className="text-gray-500 text-xs font-mono">
        Chalamandra Magistral © 2025 | DecoX Architecture
      </p>
      <p className="text-gray-700 text-[10px] mt-1 uppercase tracking-widest">
        SRAP Methodology: Resilience & Strategy
      </p>
      <p className="mt-4 text-[10px] text-gray-600">
        ¿Quieres ir más profundo?{' '}
        <a
          href="https://interactive.chalamandramagistral.com/?utm_source=oraculo&utm_medium=footer&utm_campaign=ecosystem"
          className="text-chala-gold hover:text-yellow-400 underline underline-offset-2 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Explorar el Sistema Completo →
        </a>
      </p>
    </footer>
  );
};