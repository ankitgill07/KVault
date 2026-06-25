import React from 'react';
import { motion } from 'framer-motion';
import { Layout, Server, Cpu, Smartphone, Brain, BarChart2, Cloud, GitBranch, Palette, ShieldAlert } from 'lucide-react';
import { CATEGORIES } from '../data/courses';

// Mapping strings to Lucide components
const IconMap: { [key: string]: React.ComponentType<any> } = {
  Layout,
  Server,
  Cpu,
  Smartphone,
  Brain,
  BarChart2,
  Cloud,
  GitBranch,
  Palette,
  ShieldAlert
};

interface CategoriesProps {
  onSelectCategory: (categoryName: string) => void;
}

export const Categories: React.FC<CategoriesProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <h2 className="text-4xl font-extrabold text-brand-navy tracking-tight">
          Explore Specialties
        </h2>
        <p className="text-base text-brand-gray font-medium leading-relaxed">
          Unlock structured pathways designed to take you from absolute novice to enterprise-ready master.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {CATEGORIES.map((cat, idx) => {
          // Map Figma -> Palette
          const iconKey = cat.iconName === 'Figma' ? 'Palette' : cat.iconName;
          const IconComponent = IconMap[iconKey] || Cpu;
          
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              whileHover={{ 
                y: -6,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              onClick={() => onSelectCategory(cat.name)}
              className="group cursor-pointer bg-white rounded-3xl p-6 border border-brand-border premium-shadow hover:premium-shadow-hover transition-all duration-300 relative overflow-hidden"
            >
              {/* Animated hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-purple/5 to-brand-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-350"></div>

              {/* Icon Container with Gradient Background */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center text-white premium-shadow mb-5 transition-transform group-hover:rotate-6`}>
                <IconComponent className="w-6 h-6 stroke-[2px]" />
              </div>

              {/* Title & Count */}
              <h3 className="font-bold text-sm text-brand-navy leading-snug group-hover:text-brand-purple transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-brand-gray font-semibold mt-1.5 flex items-center gap-1">
                <span>{cat.count} curated courses</span>
                <span className="w-1 h-1 rounded-full bg-brand-border group-hover:bg-brand-purple transition-colors"></span>
              </p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
