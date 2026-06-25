import React from 'react';
import { motion } from 'framer-motion';
import { Code, Clock, Feather, Milestone } from 'lucide-react';

interface ChooseItem {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

const ITEMS: ChooseItem[] = [
  {
    title: 'Learn By Building',
    description: 'Construct production-ready repositories and projects instead of watching endless, theoretical slide decks.',
    icon: Code,
    gradient: 'from-[#7C3AED] to-[#A78BFA]'
  },
  {
    title: 'Learn At Your Own Pace',
    description: 'Access thoughtfully structured syllabus modules 24/7 with zero deadlines or rigid calendars.',
    icon: Clock,
    gradient: 'from-[#6366F1] to-[#818CF8]'
  },
  {
    title: 'Carefully Crafted Content',
    description: 'Skip the fluff. Every lesson is meticulously edited for maximum information density and clarity.',
    icon: Feather,
    gradient: 'from-[#EC4899] to-[#F472B6]'
  },
  {
    title: 'Personalized Journeys',
    description: 'Track your weekly learning streaks, secure verifiable credentials, and continue exactly where you paused.',
    icon: Milestone,
    gradient: 'from-[#F59E0B] to-[#FBBF24]'
  }
];

export const WhyChoose: React.FC = () => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
      {/* Mesh effect background behind WhyChoose */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-section/40 to-transparent rounded-[48px] pointer-events-none -z-10"></div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left header descriptive column */}
        <div className="lg:col-span-4 space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-purple">
            Platform Ethos
          </span>
          <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight leading-snug">
            Designed For Serious Learners.
          </h2>
          <p className="text-sm font-semibold text-brand-gray leading-relaxed">
            KVault eliminates learning fatigue by replacing passive video playlists with hands-on projects, high-fidelity syllabus timelines, and Apple-inspired UX.
          </p>
        </div>

        {/* Right 2x2 grid of premium cards */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white rounded-4xl p-8 border border-brand-border premium-shadow hover:premium-shadow-hover transition-all duration-300 relative overflow-hidden"
              >
                {/* Micro corner highlight */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${item.gradient} opacity-5 rounded-bl-full`}></div>

                {/* Styled Floating Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.gradient} flex items-center justify-center text-white premium-shadow mb-6`}>
                  <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>

                <h3 className="font-extrabold text-lg text-brand-navy mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-brand-gray font-semibold leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
