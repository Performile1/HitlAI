'use client';

import { useState } from 'react';

interface HybridSliderProps {
  onRatioChange: (aiRatio: number, humanRatio: number) => void;
  aiCostPerCredit?: number;
  humanCostPerCredit?: number;
}

export default function HybridSlider({
  onRatioChange,
  aiCostPerCredit = 1.5,
  humanCostPerCredit = 15.0
}: HybridSliderProps) {
  const [humanPercentage, setHumanPercentage] = useState(0);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setHumanPercentage(value);
    const aiRatio = (100 - value) / 100;
    const humanRatio = value / 100;
    onRatioChange(aiRatio, humanRatio);
  };

  const aiPercentage = 100 - humanPercentage;
  const estimatedCost = (aiPercentage / 100) * aiCostPerCredit + (humanPercentage / 100) * humanCostPerCredit;

  return (
    <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">AI / Human Test Ratio</h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-500">${estimatedCost.toFixed(2)}</p>
          <p className="text-xs text-slate-400">per test</p>
        </div>
      </div>

      <div className="relative pt-6 pb-2">
        <input
          type="range"
          min="0"
          max="100"
          value={humanPercentage}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #4F46E5 0%, #4F46E5 ${aiPercentage}%, #10B981 ${aiPercentage}%, #10B981 100%)`
          }}
        />
        <div className="flex justify-between mt-2">
          <span className="text-sm text-indigo-400 font-semibold">100% AI</span>
          <span className="text-sm text-emerald-400 font-semibold">100% Human</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-indigo-900/20 rounded-lg border border-indigo-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
            <p className="text-sm font-semibold text-indigo-400">AI Testing</p>
          </div>
          <p className="text-3xl font-bold text-white">{aiPercentage}%</p>
          <p className="text-xs text-slate-400 mt-1">
            ${((aiPercentage / 100) * aiCostPerCredit).toFixed(2)} cost
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Fast, automated testing with 12 AI agents
          </p>
        </div>

        <div className="p-4 bg-emerald-900/20 rounded-lg border border-emerald-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            <p className="text-sm font-semibold text-emerald-400">Human Testing</p>
          </div>
          <p className="text-3xl font-bold text-white">{humanPercentage}%</p>
          <p className="text-xs text-slate-400 mt-1">
            ${((humanPercentage / 100) * humanCostPerCredit).toFixed(2)} cost
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Real user feedback and validation
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-400 mb-2">Recommendation</h4>
        <p className="text-sm text-slate-300">
          {humanPercentage === 0 && 'Pure AI testing - Fast and cost-effective for initial testing'}
          {humanPercentage > 0 && humanPercentage < 30 && 'AI-first with human validation - Good balance for most projects'}
          {humanPercentage >= 30 && humanPercentage < 70 && 'Balanced approach - Comprehensive testing with human insights'}
          {humanPercentage >= 70 && 'Human-focused - Best for critical UX or accessibility testing'}
        </p>
      </div>
    </div>
  );
}
