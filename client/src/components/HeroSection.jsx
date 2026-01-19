import React from 'react';
import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Content */}
      <div className="container max-w-4xl mx-auto text-center relative z-10">
        {/* Large bold headline */}
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-16 text-foreground leading-tight px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          This isn&apos;t a traditional portfolio.
        </motion.h1>

        {/* Subheading */}
        <motion.p 
          className="text-xl sm:text-2xl md:text-3xl text-foreground/80"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          It&apos;s an interactive system that shows how I approach real world ML problems.
        </motion.p>
      </div>

      {/* Bottom scroll hint */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10">
        <motion.p 
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold whitespace-nowrap"
          animate={{ 
            opacity: [0.4, 1, 0.4],
            color: ['hsl(var(--foreground))', 'hsl(var(--primary))', 'hsl(var(--foreground))']
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Scroll to see how this works.
        </motion.p>
      </div>

      {/* Faint vertical gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-0" />
    </section>
  );
};
