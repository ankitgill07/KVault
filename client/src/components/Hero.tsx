import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, Check, TrendingUp, Award, FileText } from 'lucide-react';

interface HeroProps {
  onExploreClick: () => void;
  onStartClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreClick, onStartClick }) => {
  return (
    <section className="relative pt-12 pb-24 px-4 md:px-8 max-w-7xl mx-auto w-full overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-20 left-1/3 w-72 h-72 bg-brand-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Side Content */}
        <div className="lg:col-span-6 space-y-8 z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-section border border-brand-blue/20 text-brand-purple text-xs font-bold tracking-wide premium-shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Platform • Built For Modern Learners</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-extrabold tracking-tight text-brand-navy leading-[1.1]"
          >
            Learn Future Skills. <br />
            <span className="text-gradient-purple">Build Real Projects.</span> <br />
            Grow With Confidence.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-brand-gray font-medium leading-relaxed max-w-xl"
          >
            Discover thoughtfully crafted courses and hands-on learning experiences designed for developers, creators, and professionals.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button
              onClick={onExploreClick}
              className="px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-brand-purple to-brand-blue hover:opacity-95 rounded-full transition-all duration-200 premium-shadow hover:scale-[1.02] cursor-pointer"
            >
              Explore Courses
            </button>
            <button
              onClick={onStartClick}
              className="px-8 py-4 text-sm font-bold text-brand-navy bg-white hover:bg-bg-secondary border border-brand-border rounded-full transition-all duration-200 premium-shadow hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 text-brand-purple fill-brand-purple" />
              Start Learning
            </button>
          </motion.div>

          {/* Why KVault? Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-8 border-t border-brand-border/60"
          >
            <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider mb-4">
              Why KVault?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                'Carefully Curated Content',
                'Project-Based Learning',
                'Lifetime Access & Updates',
                'Flexible Learning Paths',
                'Modern Learning Experience'
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-sm font-semibold text-brand-navy">
                  <div className="w-5 h-5 rounded-full bg-brand-success/10 flex items-center justify-center text-brand-success">
                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Side Parallax Cards */}
        <div className="lg:col-span-6 relative h-[500px] w-full flex items-center justify-center lg:justify-end">
          
          {/* Card 1: Learning Progress */}
          <motion.div
            animate={{ 
              y: [-12, 12],
              rotate: [0, 1, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute top-10 left-4 sm:left-12 glass-card rounded-3xl p-5 premium-shadow w-64 border border-white/60 z-20 animate-in fade-in"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-2xl bg-brand-purple/10 text-brand-purple">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-extrabold bg-brand-purple/10 text-brand-purple px-2 py-0.5 rounded-full">
                Active Learning
              </span>
            </div>
            <h4 className="font-bold text-sm text-brand-navy">Advanced React Pattern</h4>
            <p className="text-xs text-brand-gray mt-1">Sarah Jenkins • Chapter 2</p>
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-brand-navy">
                <span>Course Progress</span>
                <span>72%</span>
              </div>
              <div className="w-full h-2 bg-brand-section rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-purple to-brand-blue rounded-full w-[72%]"></div>
              </div>
            </div>
          </motion.div>

          {/* Card 2: AI Mentor */}
          <motion.div
            animate={{ 
              y: [10, -10],
              rotate: [0, -1, 0]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute bottom-8 left-0 sm:left-6 glass-card rounded-3xl p-5 premium-shadow w-72 border border-white/60 z-30 animate-in fade-in"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center text-white font-extrabold text-xs">
                AI
              </div>
              <div>
                <h4 className="font-bold text-xs text-brand-navy">KVault Mentor</h4>
                <p className="text-[10px] text-brand-success font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-ping"></span>
                  Online Assistant
                </p>
              </div>
            </div>
            <div className="p-3 bg-brand-section/80 rounded-2xl border border-brand-blue/5">
              <p className="text-xs font-medium text-brand-navy leading-relaxed">
                "Excellent work on Context APIs! Try out the Zustand code challenges next to solidify your state management skills."
              </p>
            </div>
          </motion.div>

          {/* Card 3: Certificates */}
          <motion.div
            animate={{ 
              x: [-8, 8],
              y: [-8, 8]
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute top-36 right-0 sm:right-10 glass-card rounded-3xl p-4 premium-shadow w-60 border border-white/60 z-10 animate-in fade-in animate-out"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-brand-gold/10 text-brand-gold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-brand-navy">Certificate Unlocked</h4>
                <p className="text-[10px] text-brand-gray mt-0.5">Full Stack Web Engineer</p>
                <p className="text-[9px] font-mono text-brand-purple mt-1 bg-brand-purple/5 px-1.5 py-0.5 rounded inline-block">
                  ID: KV-982-FSA
                </p>
              </div>
            </div>
          </motion.div>

          {/* Card 4: Study Note */}
          <motion.div
            animate={{ 
              y: [15, -15],
              x: [5, -5]
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className="absolute bottom-28 right-4 sm:right-12 glass-card rounded-3xl p-4 premium-shadow w-56 border border-white/60 z-20 animate-in fade-in"
          >
            <div className="flex items-center gap-2 mb-2 text-brand-navy">
              <FileText className="w-4 h-4 text-brand-purple" />
              <span className="text-xs font-bold">Study Insights</span>
            </div>
            <p className="text-[11px] text-brand-gray font-medium leading-relaxed italic">
              "Always memoize selector functions in Zustand to keep component re-renders minimal."
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
