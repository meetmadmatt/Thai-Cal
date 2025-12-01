import React, { useRef } from 'react';
import { Delete } from 'lucide-react';

interface NumberPadProps {
  onInput: (val: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

const NumberPad: React.FC<NumberPadProps> = ({ onInput, onDelete, onClear }) => {
  const buttons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handlePointerDown = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      onClear();
    }, 500);
  };

  const handlePointerUp = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPress.current) {
      onDelete();
    }
  };

  const handlePointerLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3 p-1">
      {buttons.map((btn) => (
        <button
          key={btn}
          onClick={() => onInput(btn)}
          className="h-14 rounded border border-matrix-light/20 bg-matrix-dim/50 text-2xl font-mono text-matrix-neon active:bg-matrix-neon/20 active:border-matrix-neon active:shadow-neon-sm transition-all"
        >
          {btn}
        </button>
      ))}
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()}
        className="h-14 rounded border border-red-900/40 bg-red-900/10 text-red-400 flex items-center justify-center active:bg-red-900/30 transition-all hover:border-red-500/50"
      >
        <Delete size={20} />
      </button>
    </div>
  );
};

export default NumberPad;