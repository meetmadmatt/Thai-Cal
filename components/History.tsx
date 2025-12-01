import React from 'react';
import { Expense } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';

interface HistoryProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  exchangeRate: number;
}

const History: React.FC<HistoryProps> = ({ expenses, onDelete, exchangeRate }) => {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-matrix-neon/30 font-mono">
        <p className="animate-pulse">_NO_RECORDS_FOUND_</p>
      </div>
    );
  }

  // Group by date
  const grouped = expenses.reduce((acc, expense) => {
    const dateKey = format(expense.timestamp, 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="pb-24 pt-4 px-6 overflow-y-auto no-scrollbar h-full font-mono">
      {sortedDates.map((date) => (
        <div key={date} className="mb-8">
          <div className="flex items-center space-x-2 mb-3 sticky top-0 bg-matrix-black/95 backdrop-blur py-2 z-10 border-b border-matrix-neon/20">
            <div className="h-2 w-2 bg-matrix-neon rounded-full animate-pulse"></div>
            <h3 className="text-matrix-neon font-bold text-xs uppercase tracking-widest">
                {format(new Date(date), 'yyyy.MM.dd // EEEE')}
            </h3>
          </div>
          <div className="space-y-3">
            {grouped[date].sort((a, b) => b.timestamp - a.timestamp).map((exp) => (
              <div key={exp.id} className="bg-matrix-dim border border-matrix-neon/20 rounded p-3 flex items-center justify-between relative group overflow-hidden transition-all hover:border-matrix-neon/50">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded bg-matrix-black border border-matrix-neon/10 text-matrix-neon`}>
                    {CATEGORY_ICONS[exp.category]}
                  </div>
                  <div>
                    <div className="text-matrix-text text-sm font-bold truncate max-w-[150px]">{exp.description || exp.category}</div>
                    <div className="text-[10px] text-matrix-neon/60 flex items-center gap-2 mt-1">
                      {exp.paymentMethod === 'Credit Card' && <span className="text-blue-400 bg-blue-900/20 px-1 rounded border border-blue-900/50">CARD</span>}
                      {exp.isSplit && <span className="text-orange-400 bg-orange-900/20 px-1 rounded border border-orange-900/50">SPLIT 1/{exp.splitCount}</span>}
                      <span className="font-mono opacity-60">[{format(exp.timestamp, 'HH:mm')}]</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-matrix-neon tracking-tighter">
                    ฿ {exp.splitAmountTHB.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-matrix-neon/60">
                    ≈ $ {(exp.splitAmountTHB * exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                  </span>
                </div>

                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        if(confirm('CONFIRM DELETION?')) onDelete(exp.id);
                    }}
                    className="absolute right-0 top-0 bottom-0 w-16 bg-red-900/80 flex items-center justify-center translate-x-full group-hover:translate-x-0 transition-transform duration-200"
                >
                    <Trash2 className="text-white" size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default History;