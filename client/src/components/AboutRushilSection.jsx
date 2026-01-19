import React from 'react';
import { motion } from 'framer-motion';

export const AboutRushilSection = () => {
  return (
    <section id="about-rushil" className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-20">
      <div className="container max-w-3xl mx-auto">
        {/* Heading */}
        <motion.h1 
          className="text-5xl sm:text-6xl md:text-7xl font-bold mb-12 text-foreground leading-tight text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          About Me
        </motion.h1>

        {/* Portrait Photo */}
        <motion.div 
          className="mb-12 flex justify-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-border/50 overflow-hidden">
            <img 
              src="/pfp.jpg" 
              alt="Rushil Chandrupatla" 
              className="w-full h-full object-cover"
              style={{ objectPosition: '58% center' }}
            />
          </div>
        </motion.div>

        {/* Bio text */}
        <motion.div 
          className="space-y-6 text-lg sm:text-xl text-foreground/90 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>
            Hi! I'm Rushil, a 4th year Data Science Undergraduate at UC San Diego. I built this site to show how I reason about problems before I try to solve them.
          </p>
          <p>
            I'm most interested in the planning layer of engineering: how problems are framed, how assumptions are surfaced, and how systems are designed so that decisions can be evaluated rather than guessed. In my experience, the quality of the framework is the most influential to developing strong systems.
          </p>
          <p>
            A big part of my motivation is building things that help people understand what's actually happening under the hood. I care about lowering the barrier between advanced technology and the people who interact with it, whether they're developers or end users. If something works but is difficult to reason about, there's still more work to be done.
          </p>
          <p>
            Outside of engineering, I'm a hobby photographer and dancer, and I spend more weekends than I'd like to admit watching football and playing basketball. Those interests give me a balance outside of work and a way to stay present without worrying about outcomes.
          </p>
        </motion.div>

        {/* Small muted line at bottom */}
        <motion.p 
          className="text-sm text-muted-foreground mt-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Everything else on this site shows how I think when I build.
        </motion.p>
      </div>
    </section>
  );
};
