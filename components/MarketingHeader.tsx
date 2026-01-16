'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MarketingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-slate-900">HitlAI</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-slate-600 hover:text-slate-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900 transition-colors">
              Pricing
            </Link>
            <div className="relative group">
              <button className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1">
                Programs
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/early-adopter" className="block px-4 py-3 text-slate-700 hover:bg-blue-50 rounded-t-lg transition-colors">
                  <div className="font-semibold text-blue-600">Early Adopter</div>
                  <div className="text-xs text-slate-600">Up to 25% lifetime discount</div>
                </Link>
                <Link href="/founding-tester" className="block px-4 py-3 text-slate-700 hover:bg-green-50 rounded-b-lg transition-colors">
                  <div className="font-semibold text-green-600">Founding Tester</div>
                  <div className="text-xs text-slate-600">40% revenue + equity</div>
                </Link>
              </div>
            </div>
            <Link href="/demo" className="text-slate-600 hover:text-slate-900 transition-colors">
              Demo
            </Link>
            <Link href="/about" className="text-slate-600 hover:text-slate-900 transition-colors">
              About
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/tester/login">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Tester Login
              </Button>
            </Link>
            <Link href="/company/login">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Company Login
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
            <div className="flex flex-col gap-4">
              <Link 
                href="/features" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/pricing" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <div className="pl-4 space-y-2 border-l-2 border-slate-200">
                <Link 
                  href="/early-adopter" 
                  className="block text-blue-600 hover:text-blue-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Early Adopter Program
                </Link>
                <Link 
                  href="/founding-tester" 
                  className="block text-green-600 hover:text-green-700 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Founding Tester Program
                </Link>
              </div>
              <Link 
                href="/demo" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Demo
              </Link>
              <Link 
                href="/about" 
                className="text-slate-600 hover:text-slate-900 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-200">
                <Link href="/tester/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                    Tester Login
                  </Button>
                </Link>
                <Link href="/company/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Company Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
