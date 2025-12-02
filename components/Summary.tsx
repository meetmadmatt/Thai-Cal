import React, { useMemo } from 'react';
import type { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Expense, Category } from '../types';
import type { CATEGORY_COLORS } from '../constants';

interface SummaryProps {
  expenses: Expense[];
  exchangeRate: number;
}

const Summary: React.FC<SummaryProps> = ({ expenses, exchangeRate }) => {
  const totalTHB = useMemo(() => expenses.reduce((sum, e) => sum + e.splitAmountTHB, 0), [expenses]);
  const totalHKD = totalTHB * exchangeRate;

  const data = useMemo(() => {
    const catMap = new Map<Category, number>();
    expenses.forEach(e => {
      const current = catMap.get(e.category) || 0;
      catMap.set(e.category, current + e.splitAmountTHB);
    });

    return Array.from(catMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  return (
    <div className="flex flex-col h-full space-y-4 p-6 pb-24 overflow-y-auto no-scrollbar font-mono">
      <div className="bg-matrix-dim border border-matrix-neon/30 p-6 rounded shadow-neon-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 text-matrix-neon/30 text-[10px]">SYSTEM_STATUS: SPENDING</div>
        <h3 className="text-matrix-neon/60 text-xs font-bold uppercase tracking-widest mb-2">Total Output</h3>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold text-matrix-neon drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]">
            ฿ {totalTHB.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <span className="text-sm text-matrix-neon/60">THB</span>
        </div>
        <div className="text-matrix-neon/80 font-mono text-sm mt-2 border-t border-matrix-neon/20 pt-2">
          ≈ $ {totalHKD.toLocaleString(undefined, { maximumFractionDigits: 1 })} HKD
        </div>
      </div>

      <div className="bg-matrix-dim border border-matrix-neon/20 p-4 rounded flex-grow min-h-[300px]">
        <h3 className="text-matrix-neon/60 text-xs font-bold uppercase tracking-widest mb-4">Allocation</h3>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`฿ ${value.toLocaleString()} THB`, 'Spent']}
                contentStyle={{ 
                    backgroundColor: '#0a0f0a', 
                    borderColor: '#00ff41', 
                    color: '#e0ffe0',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                }}
                itemStyle={{ color: '#00ff41' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-matrix-neon/30 text-xs">
            NO_DATA_AVAILABLE
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {data.map((item) => (
            <div key={item.name} className="flex justify-between items-center bg-matrix-black border border-matrix-neon/10 p-3 rounded">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full shadow-[0_0_5px]" style={{ backgroundColor: CATEGORY_COLORS[item.name as Category], boxShadow: `0 0 5px ${CATEGORY_COLORS[item.name as Category]}` }}></div>
                    <span className="text-matrix-text text-xs uppercase tracking-wider">{item.name}</span>
                </div>
                <div className="text-matrix-neon font-mono text-sm">
                    ฿ {item.value.toLocaleString()}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Summary;
