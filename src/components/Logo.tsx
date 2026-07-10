import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'vertical' | 'horizontal';
}

export function Logo({ className = "w-32", variant = 'vertical' }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <img 
        src={`${import.meta.env.BASE_URL}logo.png`} 
        alt="تقييم" 
        className="w-full h-auto object-contain drop-shadow-sm"
        onError={(e) => {
          // Fallback if the user hasn't uploaded logo.png yet
          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiMyYzRjM2IiPtmF2YjZi2Y2jDwtL3RleHQ+PC9zdmc+';
        }}
      />
    </div>
  );
}
