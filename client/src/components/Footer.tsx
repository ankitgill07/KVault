import React from 'react';
import { Hexagon, Send } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-brand-border/60 mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        
        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 mb-16">
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-blue flex items-center justify-center text-white premium-shadow">
                <Hexagon className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-brand-navy">
                KVault
              </span>
            </div>
            <p className="text-xs font-semibold text-brand-gray leading-relaxed max-w-xs">
              Learn future skills, build real projects, and grow with confidence on the web's most refined learning platform.
            </p>
          </div>

          {/* Column 1: Explore */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-brand-gray">
              <li><a href="#" className="hover:text-brand-purple transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Roadmaps</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Specialties</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Column 2: Resources */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-brand-gray">
              <li><a href="#" className="hover:text-brand-purple transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Study Guides</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Community</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-xs font-semibold text-brand-gray">
              <li><a href="#" className="hover:text-brand-purple transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Changelog</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-brand-purple transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-4 col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Newsletter</h4>
            <p className="text-[11px] text-brand-gray leading-relaxed mb-3">
              Subscribe to get updates on new modules.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="you@domain.com"
                className="w-full pl-3 pr-10 py-2.5 bg-bg-secondary border border-transparent rounded-xl text-xs font-semibold focus:bg-white focus:border-brand-purple transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 px-2.5 rounded-lg bg-brand-purple hover:bg-brand-blue text-white transition-colors flex items-center justify-center">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-brand-gray">
          <div>
            <span>© 2026 KVault • Learn Beyond Boundaries</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="hover:text-brand-purple transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-purple transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-purple transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
