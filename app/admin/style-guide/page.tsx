import React from 'react';

const ColorSwatch = ({ name, hex, tailwind }: { name: string; hex: string; tailwind: string }) => (
  <div className="flex flex-col items-center">
    <div className={`w-20 h-20 ${tailwind} rounded-md shadow-md mb-2`}></div>
    <span className="text-slate-300 text-sm font-medium">{name}</span>
    <span className="text-slate-500 text-xs">{hex}</span>
  </div>
);

export default function BrandStyleGuidePage() {
  return (
    <div className="p-8 space-y-12 bg-slate-900 text-white min-h-screen font-sans">
      <h1 className="text-4xl font-bold text-indigo-400">HitlAI Brand Style Guide</h1>
      <p className="text-lg text-slate-300">
        This page defines the core visual identity for HitlAI (IP by Rickard Wigrund).
        Refer to these tokens for all UI development to maintain a unified corporate ID.
      </p>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <ColorSwatch name="Primary (Indigo-600)" hex="#4F46E5" tailwind="bg-indigo-600" />
          <ColorSwatch name="Secondary (Slate-900)" hex="#0F172A" tailwind="bg-slate-900" />
          <ColorSwatch name="Accent (Emerald-500)" hex="#10B981" tailwind="bg-emerald-500" />
          <ColorSwatch name="Friction/Error (Rose-500)" hex="#F43F5E" tailwind="bg-rose-500" />
          <ColorSwatch name="Text Primary (White)" hex="#FFFFFF" tailwind="bg-white border border-slate-700 text-slate-800" />
          <ColorSwatch name="Text Secondary (Slate-300)" hex="#CBD5E1" tailwind="bg-slate-300 text-slate-800" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Typography</h2>
        <div className="space-y-2">
          <p className="text-4xl font-extrabold font-sans">H1 - The Quick Fox (Inter/Sans-serif)</p>
          <p className="text-3xl font-bold font-sans">H2 - The Quick Fox (Inter/Sans-serif)</p>
          <p className="text-xl font-semibold font-sans">H3 - The Quick Fox (Inter/Sans-serif)</p>
          <p className="text-lg font-medium font-sans">Body - The quick brown fox jumps over the lazy dog. (Inter/Sans-serif)</p>
          <p className="text-lg font-mono text-slate-400">Code/AI - The quick brown fox jumps over the lazy dog. (Mono)</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Primary Button
          </button>
          <button className="px-6 py-3 bg-emerald-500 text-slate-900 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
            Accent Button
          </button>
          <button className="px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors">
            Secondary Button
          </button>
          <button className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-900/20 transition-colors">
            Outline Button
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Borders & Shadows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
            <p className="text-slate-300">Default Card/Container</p>
            <p className="text-sm text-slate-500">rounded-lg, border-slate-700, shadow-lg</p>
          </div>
          <div className="p-4 bg-indigo-900/30 rounded-lg border border-indigo-700 shadow-xl">
            <p className="text-slate-300">Highlighted Container (e.g., Active Test)</p>
            <p className="text-sm text-slate-500">rounded-lg, border-indigo-700, shadow-xl</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Mission Cards (Tester UI)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 shadow-lg hover:border-indigo-600 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">E-commerce Checkout Flow</h3>
                <p className="text-sm text-slate-400">Elderly Persona • 15 min</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-500">$15.00</p>
                <p className="text-xs text-slate-500">Base Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{width: '65%'}}></div>
              </div>
              <span className="text-sm text-slate-400">65% AI Confidence</span>
            </div>
            <p className="text-sm text-slate-300">Test a shopping cart experience for senior users</p>
          </div>

          <div className="p-6 bg-indigo-900/30 rounded-lg border border-indigo-700 shadow-xl hover:border-indigo-500 transition-all cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">🔥 Dispute Audit</h3>
                <p className="text-sm text-indigo-300">High Priority • 20 min</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-400">$22.50</p>
                <p className="text-xs text-emerald-500">+50% Bonus</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{width: '30%'}}></div>
              </div>
              <span className="text-sm text-rose-400">30% AI Confidence</span>
            </div>
            <p className="text-sm text-slate-300">Validate AI findings - Company disputed results</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Trust Score Ring</h2>
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.85)}`}
                className="text-emerald-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">850</span>
              <span className="text-xs text-slate-400">Trust Score</span>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-slate-300"><span className="font-bold text-emerald-500">Elite Tier</span> - Access to Dispute Audits</p>
            <p className="text-sm text-slate-400">Next milestone: 900 (Judge Tier)</p>
            <div className="flex gap-2 mt-2">
              <div className="px-3 py-1 bg-emerald-900/30 border border-emerald-700 rounded text-xs text-emerald-400">
                +15% Earnings
              </div>
              <div className="px-3 py-1 bg-indigo-900/30 border border-indigo-700 rounded text-xs text-indigo-400">
                Priority Access
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-3xl font-semibold text-indigo-300">Admin Dispute Review</h2>
        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-700">
            <div>
              <h3 className="text-xl font-bold text-white">Dispute #D-2024-0042</h3>
              <p className="text-sm text-slate-400">Company: TechCorp Inc. • Credits in Escrow: 10 + $5.00 Penalty</p>
            </div>
            <div className="px-4 py-2 bg-amber-900/30 border border-amber-700 rounded-lg">
              <span className="text-amber-400 font-semibold">PENDING REVIEW</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-indigo-400">AI Findings</h4>
              <div className="p-4 bg-slate-900 rounded border border-slate-700 font-mono text-sm text-slate-300">
                <p>• Button contrast ratio: 4.2:1 (PASS)</p>
                <p>• Click target size: 48x48px (PASS)</p>
                <p>• Navigation clear (PASS)</p>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-emerald-400">Human Findings (3/3 Agree)</h4>
              <div className="p-4 bg-slate-900 rounded border border-emerald-700 font-mono text-sm text-slate-300">
                <p>• Button contrast ratio: 4.2:1 (PASS)</p>
                <p className="text-rose-400">• Click target overlaps menu (FAIL)</p>
                <p>• Navigation clear (PASS)</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
              UPHOLD AI - Charge Penalty
            </button>
            <button className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors">
              OVERRULE AI - Refund Company
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
