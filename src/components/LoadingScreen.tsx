'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-pink/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/20 blur-[120px] rounded-full" />
      
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 border-2 border-white/10"
          >
            <Sparkles className="w-12 h-12" />
          </motion.div>
          
          <div className="flex flex-col items-center gap-3">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic"
            >
              Apê 2026
            </motion.h2>
            
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-2 bg-brand-pink-dark rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skeleton Simulation */}
        <div className="mt-12 w-80 space-y-4 opacity-20">
          <div className="h-4 w-1/2 bg-slate-300 rounded-full mx-auto animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-slate-300 rounded-3xl animate-pulse" />
            <div className="h-24 bg-slate-300 rounded-3xl animate-pulse" />
          </div>
          <div className="h-32 bg-slate-300 rounded-[32px] animate-pulse" />
        </div>
      </div>
      
      {/* Shimmer Effect */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        animate={{
          background: [
            "linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%, rgba(255,255,255,0) 100%)",
            "linear-gradient(110deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 60%, rgba(255,255,255,0) 100%)"
          ],
          backgroundPosition: ["200% 0", "-200% 0"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ backgroundSize: "200% 100%" }}
      />
    </div>
  );
}
