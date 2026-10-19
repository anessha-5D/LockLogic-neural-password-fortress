import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PasswordAnalyzer } from './components/PasswordAnalyzer';
import { AttackLab } from './components/AttackLab';
import { HowItWorks } from './components/HowItWorks';
import { SecurityTips } from './components/SecurityTips';
import { Footer } from './components/Footer';
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { analyzePassword } from './utils/analyzer';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLightMode, setIsLightMode] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [password, setPassword] = useState('LockLogic#Valkyrie92');

  const analyzerSectionRef = useRef<HTMLDivElement>(null);
  const attackLabSectionRef = useRef<HTMLDivElement>(null);

  // Compute live cryptanalysis
  const analysis = useMemo(() => {
    return analyzePassword(password);
  }, [password]);

  // Handle dark / light theme toggle
  const toggleTheme = () => {
    setIsLightMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('theme-light');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#F4F5F8');
      } else {
        document.documentElement.classList.remove('theme-light');
        document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0A0B0F');
      }
      return next;
    });
  };

  const toggleReducedMotion = () => {
    setIsReducedMotion((prev) => !prev);
  };

  // Check user system preference on mount
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) setIsReducedMotion(true);
  }, []);

  const handleStartAnalyzing = () => {
    setActiveTab('analyzer');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAttackLab = () => {
    setActiveTab('attack-lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen flex flex-col relative selection:bg-[#C6FF3D]/30 selection:text-[#C6FF3D] ${isLightMode ? 'theme-light' : ''}`}>
      {/* Cinematic Preloader */}
      {loading && <Preloader onComplete={() => setLoading(false)} />}

      {/* Robotics Trailing Custom Cursor */}
      <CustomCursor isReducedMotion={isReducedMotion} />

      {/* Top 3-Zone Sticky Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLightMode={isLightMode}
        toggleTheme={toggleTheme}
        isReducedMotion={isReducedMotion}
        toggleReducedMotion={toggleReducedMotion}
      />

      {/* Main Body Content based on active view */}
      <main className="flex-1 w-full relative">
        {activeTab === 'overview' && (
          <div className="space-y-16">
            {/* 1. Cinematic Hero with 3D Shards */}
            <Hero
              score={analysis.score}
              scoreLevel={analysis.scoreLevel}
              isReducedMotion={isReducedMotion}
              isLightMode={isLightMode}
              onStartAnalyzing={handleStartAnalyzing}
              onOpenAttackLab={handleOpenAttackLab}
            />

            {/* 2. Interactive Password Analyzer Section */}
            <section ref={analyzerSectionRef} className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-12">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-[#C6FF3D]">
                    DISSECTION.STATION // IN-MEMORY
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#F4F5F7]">
                    Comprehensive Entropy Audit
                  </h2>
                </div>
                <div className="text-xs text-[#8E92A0] font-mono">
                  Current Formation: <span className="text-[#C6FF3D] font-semibold">{analysis.scoreLevel} Vault</span>
                </div>
              </div>

              <PasswordAnalyzer
                password={password}
                setPassword={setPassword}
                analysis={analysis}
              />
            </section>

            {/* 3. Attack Lab Race Preview */}
            <section ref={attackLabSectionRef} className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-white/10">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase tracking-widest text-[#00E5FF]">
                  SIMULATION.LAB // THREE VECTORS
                </span>
                <h2 className="text-2xl md:text-3xl font-bold font-heading text-[#F4F5F7]">
                  Real-Time Cracking Adversaries
                </h2>
              </div>
              <AttackLab
                currentPassword={password}
                analysis={analysis}
                onSelectPassword={setPassword}
              />
            </section>

            {/* 4. Educational Architecture Preview */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-white/10">
              <HowItWorks />
            </section>

            {/* 5. Security Tips */}
            <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-white/10">
              <SecurityTips />
            </section>
          </div>
        )}

        {activeTab === 'analyzer' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C6FF3D]">
                MODULE // DISSECTION
              </span>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#F4F5F7]">
                Password Cryptanalysis Engine
              </h1>
              <p className="text-xs sm:text-sm text-[#8E92A0]">
                Evaluate keyspace entropy, spatial dictionary graphs, and k-anonymity breach exposures.
              </p>
            </div>

            <PasswordAnalyzer
              password={password}
              setPassword={setPassword}
              analysis={analysis}
            />
          </div>
        )}

        {activeTab === 'attack-lab' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-10">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#7C5CFF]">
                MODULE // ADVERSARY
              </span>
              <h1 className="text-3xl md:text-4xl font-bold font-heading text-[#F4F5F7]">
                Live Attack Simulation Lab
              </h1>
              <p className="text-xs sm:text-sm text-[#8E92A0]">
                Educational simulation of brute force permutations, dictionary mutation rules, and pattern-heuristic searches.
              </p>
            </div>

            <AttackLab
              currentPassword={password}
              analysis={analysis}
              onSelectPassword={setPassword}
            />
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <HowItWorks />
          </div>
        )}

        {activeTab === 'tips' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
            <SecurityTips />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
