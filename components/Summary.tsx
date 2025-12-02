import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Expense, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { RefreshCw, Edit2 } from 'lucide-react';

interface SummaryProps {
  expenses: Expense[];
  exchangeRate: number;
  setExchangeRate: (rate: number) => void;
  onFetchRate: () => Promise<boolean>;
}

const Summary: React.FC<SummaryProps> = ({ expenses, exchangeRate, setExchangeRate, onFetchRate }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  
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

  const handleRefresh = async () => {
      setIsRefreshing(true);
      await onFetchRate();
      setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex flex-col h-full space-y-4 p-4 pb-24 overflow-y-auto no-scrollbar font-mono">
      
      {/* Total Output & Exchange Rate Merged Card */}
      <div className="bg-matrix-dim border border-matrix-neon/30 p-5 rounded shadow-neon-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 text-matrix-neon/30 text-[10px]">SYSTEM_STATUS: SPENDING</div>
        
        {/* Total Amounts */}
        <h3 className="text-matrix-neon/60 text-xs font-bold uppercase tracking-widest mb-2">Total Output</h3>
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-2 flex-wrap">
             <span className="text-4xl font-bold text-matrix-neon drop-shadow-[0_0_5px_rgba(0,255,65,0.8)] break-all leading-none">
              ฿ {totalTHB.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="text-sm text-matrix-neon/60">THB</span>
          </div>
          <div className="text-matrix-neon/80 font-mono text-lg mt-1">
            ≈ $ {totalHKD.toLocaleString(undefined, { maximumFractionDigits: 1 })} HKD
          </div>
        </div>

        {/* Exchange Rate Protocol Section (Merged) */}
        <div className="mt-4 border-t border-matrix-neon/20 pt-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-matrix-neon/50 uppercase tracking-wider">Exchange Protocol</span>
                    <span className="text-xs text-matrix-neon font-bold bg-matrix-black px-2 py-0.5 rounded border border-matrix-neon/20">
                        1 THB = {exchangeRate} HKD
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                     <button 
                        onClick={() => setIsEditingRate(!isEditingRate)}
                        className={`p-1.5 rounded transition-all ${isEditingRate ? 'bg-matrix-neon text-matrix-black' : 'text-matrix-neon/60 hover:text-matrix-neon hover:bg-matrix-neon/10'}`}
                     >
                         <Edit2 size={14}/>
                     </button>
                     <button 
                        onClick={handleRefresh}
                        className="p-1.5 text-matrix-neon/60 hover:text-matrix-neon hover:bg-matrix-neon/10 rounded transition-all"
                     >
                         <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''}/>
                     </button>
                </div>
            </div>
            
            {/* Collapsible Edit Input */}
            {isEditingRate && (
                <div className="mt-2 flex items-center space-x-2 animate-in slide-in-from-top-2 fade-in duration-200">
                    <span className="text-matrix-neon/50 text-xs">MANUAL_OVERRIDE &gt;</span>
                    <input 
                        type="number" 
                        step="0.001"
                        value={exchangeRate}
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                        className="flex-grow bg-matrix-black border border-matrix-neon/30 text-matrix-neon font-bold p-1 text-sm focus:border-matrix-neon outline-none"
                        autoFocus
                    />
                </div>
            )}
        </div>
      </div>

      {/* Chart Section - No Wrapper, Larger */}
      <div className="flex-none min-h-[280px] -my-2">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as Category]} stroke="rgba(0,0,0,0.8)" strokeWidth={3} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`฿ ${value.toLocaleString()} THB`, 'Spent']}
                contentStyle={{ 
                    backgroundColor: '#0a0f0a', 
                    borderColor: '#00ff41', 
                    color: '#e0ffe0',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    boxShadow: '0 0 5px #00ff41'
                }}
                itemStyle={{ color: '#00ff41' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
           <div className="h-full flex items-center justify-center text-matrix-neon/30 text-xs py-10">
            NO_DATA_AVAILABLE
          </div>
        )}
      </div>

      {/* List Section */}
      <div className="space-y-2">
        {data.map((item) => (
            <div key={item.name} className="flex justify-between items-center bg-matrix-black border border-matrix-neon/10 p-2 px-3 rounded hover:border-matrix-neon/30 transition-colors">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.name as Category], boxShadow: `0 0 4px ${CATEGORY_COLORS[item.name as Category]}` }}></div>
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