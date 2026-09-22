import React from 'react';

interface VoiceVisualizerProps {
  state: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR';
  barCount?: number;
  height?: number;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  barCount = 12,
  height = 36
}) => {
  const getBarColor = () => {
    switch (state) {
      case 'LISTENING':
        return '#38bdf8'; // Cyan
      case 'PROCESSING':
        return '#f59e0b'; // Amber
      case 'SPEAKING':
        return '#a78bfa'; // Purple
      case 'ERROR':
        return '#ef4444'; // Red
      default:
        return 'rgba(255, 255, 255, 0.2)';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        height: `${height}px`,
        padding: '0 8px'
      }}
    >
      {Array.from({ length: barCount }).map((_, index) => {
        const isActive = state === 'LISTENING' || state === 'SPEAKING';
        const delay = (index * 0.1) % 1;
        const baseHeight = state === 'IDLE' ? 4 : 8;

        return (
          <div
            key={index}
            style={{
              width: '3px',
              backgroundColor: getBarColor(),
              borderRadius: '9999px',
              height: isActive ? `${height * 0.7}px` : `${baseHeight}px`,
              animation: isActive ? `wave-animation 1.2s ease-in-out infinite alternate` : 'none',
              animationDelay: `${delay}s`,
              transition: 'all 0.2s ease'
            }}
          />
        );
      })}
    </div>
  );
};
