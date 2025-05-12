import React, { useState } from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className }: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div
          className={`absolute z-50 px-2 py-1 text-xs font-medium text-white bg-black rounded shadow-lg min-w-max -mt-1 -translate-y-full ${className || ''}`}
          style={{ top: '0', left: '50%', transform: 'translateX(-50%)' }}
        >
          {content}
          <div
            className="absolute w-2 h-2 rotate-45 bg-black"
            style={{ bottom: '-4px', left: 'calc(50% - 4px)' }}
          />
        </div>
      )}
    </div>
  );
}

export default Tooltip; 