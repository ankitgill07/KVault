import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Hammer, Infinity as InfinityIcon, ArrowUpRight, Monitor } from 'lucide-react';

interface ValueCard {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const VALUES: ValueCard[] = [
  {
    title: 'Project-Based Learning',
    description: 'Build real-world systems with robust setups. We prioritize hands-on building over passive listening.',
    icon: Hammer,
    color: 'text-brand-purple bg-brand-purple/10'
  },
  {
    title: 'Lifetime Access',
    description: 'Pay once, own forever. Rest easy knowing you have perpetual access to all updates, notes, and lessons.',
    icon: InfinityIcon,
    color: 'text-brand-blue bg-brand-blue/10'
  },
  {
    title: 'Continuous Improvements',
    description: 'Our team refines current courses and releases new modules weekly based on active community feedback.',
    icon: ArrowUpRight,
    color: 'text-brand-success bg-brand-success/10'
  },
  {
    title: 'Designed For Modern Learners',
    description: 'Ditch the spreadsheets. Track your milestones in a beautiful, unified workspace designed for visual clarity.',
    icon: Monitor,
    color: 'text-brand-gold bg-brand-gold/10'
  }
];

export const Community: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto w-full relative">
      <div className="glass-card rounded-[40px] premium-shadow border border-white/60 p-8 md:p-16 overflow-hidden relative">
        {/* Background decorations */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-purple/5 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-brand-blue/5 rounded-full blur-[80px]"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left descriptive info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-xs font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Early Access Community</span>
            </div>
            
            <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
              Shape the Future of Learning.
            </h2>
            
            <p className="text-sm font-semibold text-brand-gray leading-relaxed">
              KVault is built from the ground up for developers and creators. As an early adopter, you get direct access to instructors, community support, and input into upcoming syllabus paths.
            </p>

            <div className="pt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80'
                ].map((src, i) => (
                  <img 
                    key={i} 
                    src={src} 
                    alt="user" 
                    className="w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-brand-navy">Join active builders</span>
            </div>
          </div>

          {/* Right pillars grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="bg-white/80 backdrop-blur rounded-3xl p-6 border border-brand-border/40 premium-shadow"
                >
                  <div className={`w-10 h-10 rounded-xl ${val.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-brand-navy mb-1.5">
                    {val.title}
                  </h3>
                  <p className="text-xs text-brand-gray font-semibold leading-relaxed">
                    {val.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
