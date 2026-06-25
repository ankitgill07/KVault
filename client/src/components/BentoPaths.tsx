import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { LEARNING_PATHS } from '../data/courses';

interface BentoPathsProps {
  onPathSelect: (pathName: string) => void;
}

export const BentoPaths: React.FC<BentoPathsProps> = ({ onPathSelect }) => {
  // Define custom column span mappings for the 5 items in the Bento grid
  const getColSpan = (index: number) => {
    switch (index) {
      case 0: return 'lg:col-span-5 md:col-span-3';
      case 1: return 'lg:col-span-7 md:col-span-3';
      case 2: return 'lg:col-span-4 md:col-span-2';
      case 3: return 'lg:col-span-4 md:col-span-2';
      case 4: return 'lg:col-span-4 md:col-span-2';
      default: return 'lg:col-span-4 md:col-span-3';
    }
  };

  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
        <div className="space-y-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple">
            Career Blueprints
          </span>
          <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight">
            Featured Learning Paths
          </h2>
          <p className="text-base text-brand-gray font-medium leading-relaxed max-w-xl">
            Highly structured maps combining multiple comprehensive courses, hands-on milestones, and final capstone challenges.
          </p>
        </div>
        
        {/* Callout */}
        <div className="flex items-center gap-2 text-xs font-bold text-brand-gray bg-white border border-brand-border premium-shadow px-4 py-2.5 rounded-2xl">
          <Sparkles className="w-3.5 h-3.5 text-brand-gold animate-spin" />
          <span>Updates automatically with industry requirements</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
        {LEARNING_PATHS.map((path, idx) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.08 }}
            whileHover={{ y: -6, scale: 1.01 }}
            onClick={() => onPathSelect(path.title)}
            className={`group cursor-pointer bg-white rounded-[32px] p-8 border border-brand-border premium-shadow hover:premium-shadow-hover transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${getColSpan(idx)}`}
          >
            {/* Background decorative glow */}
            <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${path.gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity duration-300`}></div>

            {/* Path Header */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className={`text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r ${path.gradient} bg-clip-text text-transparent`}>
                    Specialist Route
                  </span>
                  <h3 className="text-2xl font-extrabold text-brand-navy mt-1 group-hover:text-brand-purple transition-colors">
                    {path.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-secondary text-brand-navy text-[11px] font-bold border border-brand-border/40">
                  <Clock className="w-3.5 h-3.5 text-brand-purple" />
                  <span>{path.duration}</span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-1.5 mb-8">
                {path.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="text-[11px] font-semibold text-brand-gray bg-bg-primary px-2.5 py-1 rounded-lg border border-brand-border/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Roadmap Steps Timeline */}
              <div className="space-y-4 relative pl-5 border-l border-brand-border/80 ml-1">
                <div className="absolute top-0 bottom-0 left-0 w-[1px] bg-gradient-to-b from-brand-purple to-brand-blue/20"></div>
                {path.roadmap.map((step, rIdx) => (
                  <div key={rIdx} className="relative group/step">
                    {/* Ring indicator */}
                    <div className="absolute -left-[24.5px] top-1 w-[10px] h-[10px] rounded-full bg-white border-2 border-brand-purple group-hover:scale-125 transition-transform"></div>
                    <p className="text-xs font-semibold text-brand-navy leading-tight">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Path CTA footer */}
            <div className="mt-8 pt-6 border-t border-brand-border/40 flex items-center justify-between">
              <span className="text-xs font-bold text-brand-gray group-hover:text-brand-purple transition-colors">
                View Curriculum
              </span>
              <div className="w-8 h-8 rounded-full bg-bg-secondary text-brand-navy flex items-center justify-center transition-all duration-300 group-hover:bg-brand-purple group-hover:text-white">
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </motion.div>
        ))}
      </div>
    </section>
  );
};
