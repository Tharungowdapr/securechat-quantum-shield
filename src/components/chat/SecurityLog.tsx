
import React, { useEffect, useRef } from 'react';

interface SecurityLogProps {
  logs: string[];
}

export const SecurityLog: React.FC<SecurityLogProps> = ({ logs }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={logRef}
      className="h-full overflow-y-auto p-4 text-xs font-mono whitespace-pre-wrap"
      style={{
        backgroundColor: '#282c34',
        color: '#abb2bf',
        fontFamily: 'monospace'
      }}
    >
      {logs.length === 0 ? (
        '[System] SecureChat initialized. Waiting for user selection...'
      ) : (
        logs.join('\n')
      )}
    </div>
  );
};
