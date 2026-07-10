import React, { memo } from 'react';
import { cn } from '../lib/utils';
import { SessionError } from '../types';

export interface WordInfo {
  id: string;
  text: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
}

interface WordDisplayProps {
  word: WordInfo;
  wordErrors: any[];
  onWordClick: (word: WordInfo) => void;
}

export const WordDisplay = memo(function WordDisplay({ word, wordErrors, onWordClick }: WordDisplayProps) {
  const hasWordError = wordErrors.some(e => e.selection_type === 'word');
  const letterErrors = wordErrors.filter(e => e.selection_type === 'letter');
  const hasLetterError = letterErrors.length > 0;

  return (
    <span 
      className={cn(
        "relative group cursor-pointer rounded-lg px-1 py-1 transition-all duration-200 inline-block",
        hasWordError ? "bg-red-100/80 text-red-700 shadow-[inset_0_-4px_0_rgba(239,68,68,0.3)] hover:bg-red-200" : hasLetterError ? "text-orange-600 bg-orange-50/50 shadow-[inset_0_-2px_0_rgba(234,88,12,0.3)] hover:bg-orange-100/50" : "text-primary-900 hover:bg-gray-100/50"
      )} 
      onClick={() => onWordClick(word)}
    >
      <span className="font-quran text-[1.7rem] md:text-3xl leading-[2.2] md:leading-[2.5] transition-colors duration-200">
        {word.text}
      </span>
      {hasLetterError && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-md shadow-sm border border-orange-200 opacity-0 group-hover:opacity-100 transition-opacity">
          {letterErrors.map(e => e.letter_text).join('،')}
        </span>
      )}
    </span>
  );
}, (prevProps, nextProps) => {
  return prevProps.word.id === nextProps.word.id && prevProps.wordErrors === nextProps.wordErrors;
});