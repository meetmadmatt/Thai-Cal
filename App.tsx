import React, { useState, useEffect } from 'react';
import { Plus, List, PieChart, Minus, Receipt, Check } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORY_ICONS, DEFAULT_EXCHANGE_RATE } from './constants';
import { Expense, Category, PaymentMethod, ViewState } from './types';
import NumberPad from './components/NumberPad';
import Summary from './components/Summary';
import History from './components/History';

const LOCAL_STORAGE_KEY = 'high_thai_expenses_v1';
const RATE_STORAGE_KEY = 'high_thai_exchange_rate_v1';

const App: React.FC = () => {
  // State
  const [view, setView] = useState<ViewState>('log');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Form State
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<Category>(Category.Food);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Cash);
  const [isSplit, setIsSplit] = useState<boolean>(false);
  const [splitCount, setSplitCount] = useState<number>(2);

  // Load data & Rate
  useEffect(() => {
    // Load Expenses
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setExpenses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse expenses", e);
      }
    }

    // Load Rate
    const savedRate = localStorage.getItem(RATE_STORAGE_KEY);
    if (savedRate) {
        try {
            const parsedRate = parseFloat(savedRate);
            if (!isNaN(parsedRate)) {
                setExchangeRate(parsedRate);
            }
        } catch (e) {
            console.error("Failed to parse saved rate", e);
        }
    } else {
        // If no saved rate, try to fetch live once on first load
        fetchLiveRate();
    }
  }, []);

  // Save expenses
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
  }, [expenses]);

  // Save Rate
  useEffect(() => {
    localStorage.setItem(RATE_STORAGE_KEY, exchangeRate.toString());
  }, [exchangeRate]);

  const fetchLiveRate = async () => {
      try {
          const res = await fetch('https://api.exchangerate-api.com/v4/latest/THB');
          const data = await res.json();
          if (data && data.rates && data.rates.HKD) {
              setExchangeRate(data.rates.HKD);
              return true;
          }
      } catch (error) {
          console.error("Failed to fetch live rate", error);
          return false;
      }
      return false;
  };

  // Form Handlers
  const handleNumberInput = (val: string) => {
    if (val === '.' && amount.includes('.')) return;
    if (amount.length > 8) return;
    setAmount(prev => prev + val);
  };

  const handleDeleteNumber = () => {
    setAmount(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
      setAmount('');
      setDescription('');
      setCategory(Category.Food);
      setPaymentMethod(PaymentMethod.Cash);
      setIsSplit(false);
      setSplitCount(2);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    const splitAmt = isSplit ? numAmount / splitCount : numAmount;

    const newExpense: Expense = {
      id: uuidv4(),
      timestamp: Date.now(),
      amountTHB: numAmount,
      amountHKD: numAmount * exchangeRate,
      category,
      description,
      paymentMethod,
      isSplit,
      splitCount: isSplit ? splitCount : 1,
      splitAmountTHB: splitAmt
    };

    setExpenses(prev => [newExpense, ...prev]);
    handleClear();
    
    // Show Success Toast
    setShowSuccessToast(true);
    setTimeout(() => {
        setShowSuccessToast(false);
    }, 2000);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Render Log View
  const renderLogView = () => (
    <div className="flex flex-col h-full font-mono">
      {/* Display Area */}
      <div className="flex-none pt-6 pb-4 px-5 bg-matrix-dim border-b border-matrix-neon/20 z-10 relative">
        <div className="flex justify-between items-start mb-2">
            <div className="text-matrix-neon/80 text-xs font-bold tracking-widest uppercase animate-pulse">
                &gt; AMOUNT_THB
            </div>
        </div>
        
        <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline overflow-hidden">
                <span className="text-2xl text-matrix-neon mr-2">฿</span>
                {/* Enlarged Amount Font - Reduced by 25% (text-6xl to text-[45px]) */}
                <span className="text-[45px] font-bold text-matrix-neon tracking-tight drop-shadow-[0_0_5px_rgba(0,255,65,0.7)] truncate">
                    {amount || '0'}
                    <span className="text-2xl ml-2 animate-pulse">_</span>
                </span>
            </div>
            {amount && (
                <div className="text-matrix-neon/80 font-mono text-sm border border-matrix-neon/40 px-2 py-1 rounded ml-2 whitespace-nowrap">
                    ≈ $ {Math.round(parseFloat(amount) * exchangeRate)}
                </div>
            )}
        </div>

        {/* Description Input */}
        <input 
            type="text" 
            placeholder="// Add description..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full mt-4 bg-matrix-black border-l-4 border-matrix-neon/50 text-matrix-text placeholder-matrix-neon/50 text-sm px-3 py-2 focus:border-matrix-neon outline-none transition-all"
        />
      </div>

      {/* Inputs Area */}
      <div className="flex-none p-4 space-y-4">
        
        {/* Category Grid */}
        <div className="grid grid-cols-4 gap-[11px]">
          {Object.values(Category).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex flex-col items-center justify-center h-[63px] rounded border transition-all duration-200 ${
                category === cat 
                  ? 'bg-matrix-neon/10 border-matrix-neon text-matrix-neon shadow-neon-sm' 
                  : 'bg-matrix-dim border-matrix-neon/20 text-matrix-neon/50 hover:border-matrix-neon/50 hover:text-matrix-neon'
              }`}
            >
              <div className="scale-125 mb-1">{CATEGORY_ICONS[cat]}</div>
              <span className="text-[9px] mt-1 font-bold uppercase tracking-wider">{cat}</span>
            </button>
          ))}
        </div>

        {/* Controls Row: Payment & Split - Reduced Height by 20% (h-12 -> h-[38px]) */}
        <div className="grid grid-cols-2 gap-3 h-[38px]">
             {/* Payment Method Switch */}
            <div className="flex bg-matrix-dim border border-matrix-neon/30 rounded p-1 w-full h-full">
                <button
                    onClick={() => setPaymentMethod(PaymentMethod.Cash)}
                    className={`flex-1 rounded text-xs font-bold transition-all h-full flex items-center justify-center uppercase tracking-wider ${
                        paymentMethod === PaymentMethod.Cash
                        ? 'bg-matrix-neon text-matrix-black shadow-neon-sm'
                        : 'text-matrix-neon/50 hover:text-matrix-neon'
                    }`}
                >
                    CASH
                </button>
                <button
                    onClick={() => setPaymentMethod(PaymentMethod.CreditCard)}
                    className={`flex-1 rounded text-xs font-bold transition-all h-full flex items-center justify-center uppercase tracking-wider ${
                        paymentMethod === PaymentMethod.CreditCard
                        ? 'bg-matrix-neon text-matrix-black shadow-neon-sm'
                        : 'text-matrix-neon/50 hover:text-matrix-neon'
                    }`}
                >
                    CARD
                </button>
            </div>
            
            {/* Split Button */}
            <div className="flex w-full h-full gap-2">
                <button 
                    onClick={() => setIsSplit(!isSplit)}
                    className={`flex-1 border rounded text-xs font-bold uppercase tracking-wider transition-all h-full flex items-center justify-center ${
                        isSplit 
                        ? 'border-matrix-neon text-matrix-neon bg-matrix-neon/10 shadow-neon-sm' 
                        : 'border-matrix-neon/30 text-matrix-neon/50 bg-matrix-dim'
                    }`}
                >
                    Split
                </button>
                
                {isSplit && (
                    <div className="flex items-center bg-matrix-dim border border-matrix-neon/30 rounded px-1 h-full w-24 justify-between">
                         <button onClick={() => setSplitCount(Math.max(2, splitCount - 1))} className="text-matrix-neon w-8 h-full flex items-center justify-center hover:bg-matrix-neon/10 rounded"><Minus size={16}/></button>
                         <span className="text-matrix-text font-mono text-sm font-bold">{splitCount}</span>
                         <button onClick={() => setSplitCount(splitCount + 1)} className="text-matrix-neon w-8 h-full flex items-center justify-center hover:bg-matrix-neon/10 rounded"><Plus size={16}/></button>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Numpad & Action */}
      <div className="flex-grow flex flex-col justify-end pb-4 px-4 space-y-4">
        <NumberPad onInput={handleNumberInput} onDelete={handleDeleteNumber} onClear={handleClear} />
        
        <div className="">
            <button 
                onClick={handleSubmit}
                disabled={!amount}
                className={`w-full h-16 rounded border font-bold text-lg flex items-center justify-center space-x-2 transition-all font-mono uppercase tracking-widest ${
                    amount 
                    ? 'bg-matrix-neon text-matrix-black border-matrix-neon hover:shadow-neon hover:bg-matrix-glitch active:translate-y-0.5' 
                    : 'bg-transparent text-matrix-neon/30 border-matrix-neon/20 cursor-not-allowed'
                }`}
            >
                <Plus strokeWidth={3} size={24} />
                <span>LOG EXPENSE</span>
            </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full max-w-md mx-auto bg-matrix-black flex flex-col relative overflow-hidden font-mono text-matrix-text border-x border-matrix-light/10 shadow-2xl">
      
      {/* Notification Toast */}
      {showSuccessToast && (
          <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in zoom-in duration-200 w-auto">
              <div className="bg-matrix-neon text-matrix-black border border-matrix-black shadow-[0_0_15px_rgba(0,255,65,0.5)] px-4 h-12 rounded flex items-center justify-center space-x-2 font-bold font-mono tracking-wider min-w-[200px]">
                  <Check size={20} strokeWidth={3} />
                  <span className="text-sm">EXPENSE LOGGED</span>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-grow relative overflow-hidden bg-matrix-black bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-matrix-dim/20 to-transparent pb-24">
        {view === 'log' && renderLogView()}
        {view === 'history' && <History expenses={expenses} onDelete={deleteExpense} exchangeRate={exchangeRate} />}
        {view === 'stats' && <Summary 
                                expenses={expenses} 
                                exchangeRate={exchangeRate} 
                                setExchangeRate={setExchangeRate}
                                onFetchRate={fetchLiveRate}
                            />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 w-full max-w-md bg-matrix-black/95 backdrop-blur border-t border-matrix-neon/20 flex items-center justify-around h-24 pb-8 z-40 shadow-[0_-5px_20px_rgba(0,255,65,0.1)]">
        <button 
            onClick={() => setView('history')}
            className={`flex flex-col items-center p-2 w-1/3 transition-colors group ${view === 'history' ? 'text-matrix-neon' : 'text-matrix-neon/50'}`}
        >
            <List size={24} className="group-hover:animate-pulse" />
            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">History</span>
        </button>
        
        <button 
            onClick={() => setView('log')}
            className={`flex flex-col items-center p-2 w-1/3 transition-colors group ${view === 'log' ? 'text-matrix-neon' : 'text-matrix-neon/50'}`}
        >
            <Receipt size={24} className="group-hover:animate-pulse" />
            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Log</span>
        </button>

        <button 
            onClick={() => setView('stats')}
            className={`flex flex-col items-center p-2 w-1/3 transition-colors group ${view === 'stats' ? 'text-matrix-neon' : 'text-matrix-neon/50'}`}
        >
            <PieChart size={24} className="group-hover:animate-pulse" />
            <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Stats</span>
        </button>
      </nav>
    </div>
  );
};

export default App;