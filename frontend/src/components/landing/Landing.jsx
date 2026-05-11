import React from 'react';
import { Navigation } from './Navigation';
import { Hero } from './Hero';
import { About } from './About';
import { Mission } from './Mission';
import { Features } from './Features';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-slate-100 selection:text-slate-900 dark:selection:bg-slate-800 dark:selection:text-slate-100">
      <Navigation />
      <Hero />
      <About />
      <Mission />
      <Features />
    </div>
  );
};