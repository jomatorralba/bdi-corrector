import React, { useState, useMemo, useRef } from 'react';
import { LayoutNeuro } from './components/LayoutNeuro';
import { bdiQuestions } from './data/bdiData';

const App: React.FC = () => {
  const [scores, setScores] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Calculate total score
  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((acc, val) => acc + val, 0);
  }, [scores]);

  // Determine severity
  const severity = useMemo(() => {
    if (totalScore <= 13) return "Depresión Mínima";
    if (totalScore <= 19) return "Depresión Leve";
    if (totalScore <= 28) return "Depresión Moderada";
    return "Depresión Grave";
  }, [totalScore]);

  // Handle change per input with Auto-Advance
  const handleChange = (id: number, valueStr: string) => {
    if (valueStr === '') {
       const newScores = { ...scores };
       delete newScores[id];
       setScores(newScores);
       return;
    }
    
    const val = parseInt(valueStr, 10);
    // Only allow 0, 1, 2, 3
    if (!isNaN(val) && val >= 0 && val <= 3) {
      setScores(prev => ({ ...prev, [id]: val }));
      
      // AUTO-ADVANCE LOGIC
      // If item id < 21, find next input and focus it
      if (id < 21) {
        const nextId = id + 1;
        const nextInput = document.getElementById(`item-${nextId}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select(); // Select text to allow easy overwrite
        }
      }
    }
  };

  const handleCalculate = () => {
    setShowResults(true);
    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleReset = () => {
    setScores({});
    setShowResults(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if at least one item is filled
  const hasData = Object.keys(scores).length > 0;
  const itemsFilled = Object.keys(scores).length;

  return (
    <LayoutNeuro testName="BDI-II Corrector">
      
      {/* Input Grid Section */}
      <div className={`transition-opacity duration-500 ${showResults ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2 tracking-tight">Registro de Puntuaciones</h1>
          <p className="text-neutral-500 text-sm">
            Introduzca el valor (0-3) para cada ítem. El cursor avanzará automáticamente al siguiente campo.
          </p>
        </div>

        {/* Grid 21 Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8">
          {bdiQuestions.map((item) => {
            const val = scores[item.id];
            const isFilled = val !== undefined;
            
            return (
              <div 
                key={item.id} 
                className={`
                  input-neuro relative flex items-center justify-between p-3 rounded-xl border transition-all duration-200
                  ${isFilled ? 'bg-white border-neutral-300 shadow-sm' : 'bg-neutral-50 border-neutral-100'}
                `}
                onClick={() => document.getElementById(`item-${item.id}`)?.focus()}
              >
                <label 
                  htmlFor={`item-${item.id}`} 
                  className="flex items-center text-sm font-medium text-neutral-600 cursor-pointer flex-grow mr-2"
                >
                  <span className={`
                    flex items-center justify-center w-6 h-6 rounded text-xs font-bold mr-3 transition-colors
                    ${isFilled ? 'bg-neutral-800 text-white' : 'bg-neutral-200 text-neutral-500'}
                  `}>
                    {item.id}
                  </span>
                  <span className={isFilled ? 'text-neutral-900' : ''}>{item.title}</span>
                </label>
                
                <input
                  id={`item-${item.id}`}
                  type="number"
                  min="0"
                  max="3"
                  placeholder="-"
                  value={val !== undefined ? val : ''}
                  onChange={(e) => handleChange(item.id, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className={`
                    w-12 h-10 text-center text-lg font-bold rounded-lg border focus:ring-2 focus:ring-neutral-900 focus:outline-none transition-all
                    ${isFilled 
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-900' 
                      : 'bg-white border-neutral-200 text-neutral-400'}
                    ${val !== undefined && val > 2 ? 'text-red-600 bg-red-50 border-red-100' : ''}
                  `}
                />
              </div>
            );
          })}
        </div>

        {/* Sticky Footer Total */}
        <div className="sticky bottom-4 z-40">
          <div className="bg-neutral-900 text-white rounded-2xl shadow-2xl p-4 flex items-center justify-between backdrop-blur-md bg-opacity-95 border border-white/10 max-w-3xl mx-auto">
             <div className="flex items-center gap-4">
                <div className="hidden sm:block">
                  <span className="text-xs uppercase tracking-widest opacity-60 font-semibold block">Ítems</span>
                  <span className="font-mono">{itemsFilled} / 21</span>
                </div>
                <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
                <div>
                  <span className="text-xs uppercase tracking-widest opacity-60 font-semibold block">Total</span>
                  <span className="text-2xl font-bold tracking-tight">{totalScore}</span>
                </div>
             </div>
             
             <button
              onClick={handleCalculate}
              disabled={!hasData}
              className={`
                px-6 py-2 rounded-xl font-bold text-sm sm:text-base transition-all
                ${hasData 
                  ? 'bg-white text-neutral-900 hover:bg-neutral-100 shadow-lg' 
                  : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'}
              `}
             >
               Analizar
             </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {showResults && (
        <div ref={resultsRef} className="mt-12 mb-20 animate-fade-in-up">
           <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-neutral-100">
            <div className="bg-neutral-900 px-6 py-8 sm:px-10 text-white relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
              
              <h2 className="text-xl font-medium opacity-80 uppercase tracking-widest mb-1 relative z-10">Resultado Clínico</h2>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
                <div>
                  <span className="text-6xl font-bold tracking-tighter">{totalScore}</span>
                  <span className="text-xl opacity-60 ml-2">puntos</span>
                </div>
                <div className="text-2xl sm:text-3xl font-semibold text-amber-300 text-right">
                  {severity}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 space-y-8">
              {/* Alerta Riesgo Suicida si Item 9 > 0 */}
              {scores[9] > 0 && (
                 <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-start">
                       <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                       </div>
                       <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">Atención: Ítem 9 Positivo</h3>
                          <div className="mt-1 text-sm text-red-700">
                             El paciente ha puntuado ({scores[9]}) en "Pensamientos Suicidas". Se recomienda evaluación de riesgo inmediata.
                          </div>
                       </div>
                    </div>
                 </div>
              )}

              <div className="bg-neutral-50 p-6 rounded-xl border border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-3">Interpretación</h3>
                <p className="text-neutral-800 leading-relaxed text-lg">
                  La suma de los ítems arroja un total de <strong>{totalScore}</strong>, situando al paciente en el rango de <strong>{severity}</strong>.
                </p>
                
                {/* Scale Reference */}
                <div className="mt-6 pt-6 border-t border-neutral-200">
                   <h4 className="text-xs font-bold text-neutral-400 uppercase mb-3">Baremos de Referencia BDI-II</h4>
                   <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className={`p-2 rounded flex justify-between ${totalScore <= 13 ? 'bg-neutral-800 text-white font-bold shadow-md' : 'text-neutral-500 bg-neutral-100'}`}><span>Mínima</span> <span>0-13</span></div>
                      <div className={`p-2 rounded flex justify-between ${totalScore >= 14 && totalScore <= 19 ? 'bg-neutral-800 text-white font-bold shadow-md' : 'text-neutral-500 bg-neutral-100'}`}><span>Leve</span> <span>14-19</span></div>
                      <div className={`p-2 rounded flex justify-between ${totalScore >= 20 && totalScore <= 28 ? 'bg-neutral-800 text-white font-bold shadow-md' : 'text-neutral-500 bg-neutral-100'}`}><span>Moderada</span> <span>20-28</span></div>
                      <div className={`p-2 rounded flex justify-between ${totalScore >= 29 ? 'bg-neutral-800 text-white font-bold shadow-md' : 'text-neutral-500 bg-neutral-100'}`}><span>Grave</span> <span>29-63</span></div>
                   </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button 
                  onClick={handleReset}
                  className="px-8 py-3 bg-white border-2 border-neutral-200 hover:border-neutral-900 text-neutral-600 hover:text-neutral-900 rounded-xl font-bold transition-all duration-200"
                >
                  Nueva Corrección
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </LayoutNeuro>
  );
};

export default App;