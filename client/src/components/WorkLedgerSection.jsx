import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Building, ArrowLeft } from 'lucide-react';
import { workLedgerData } from '../data/workLedgerData';
import { fastScrollTo } from '../lib/utils';

export const WorkLedgerSection = () => {
  const [expandedCompany, setExpandedCompany] = useState(null);

  const handleCompanyClick = (id) => {
    const wasExpanded = expandedCompany === id;
    setExpandedCompany(wasExpanded ? null : id);
    
    // If expanding (not collapsing), scroll to the card after expansion animation completes
    if (!wasExpanded) {
      setTimeout(() => {
        const element = document.querySelector(`#work-ledger-company-${id}`);
        if (element) {
          // Account for navbar height (80px) plus some padding (20px)
          // We want the top border of the card to be visible right after the navbar
          const navbarHeight = 80;
          const padding = 20;
          const targetOffset = navbarHeight + padding;
          
          // Get the absolute position of the element
          const rect = element.getBoundingClientRect();
          const absoluteTop = rect.top + window.pageYOffset;
          
          // Calculate scroll position so card top is at targetOffset from viewport top
          const scrollY = absoluteTop - targetOffset;
          fastScrollTo(scrollY, 200); // Fast scroll with 200ms duration
        }
      }, 300); // Wait for expansion animation to complete (300ms animation + small buffer)
    }
  };

  useEffect(() => {
    const handleExpandCompany = (event) => {
      const { companyId, skipAutoScroll } = event.detail;
      if (companyId) {
        setExpandedCompany(companyId);
        
        // Only auto-scroll if the card was opened directly (not programmatically)
        // This prevents duplicate scrolls when opened via "See Work Info" button
        if (!skipAutoScroll) {
          setTimeout(() => {
            const element = document.querySelector(`#work-ledger-company-${companyId}`);
            if (element) {
              // Account for navbar height (80px) plus some padding (20px)
              // We want the top border of the card to be visible right after the navbar
              const navbarHeight = 80;
              const padding = 20;
              const targetOffset = navbarHeight + padding;
              
              // Get the absolute position of the element
              const rect = element.getBoundingClientRect();
              const absoluteTop = rect.top + window.pageYOffset;
              
              // Calculate scroll position so card top is at targetOffset from viewport top
              const scrollY = absoluteTop - targetOffset;
              fastScrollTo(scrollY, 200); // Fast scroll with 200ms duration
            }
          }, 300); // Wait for expansion animation to complete (300ms animation + small buffer)
        }
      }
    };

    window.addEventListener('expandWorkLedgerCompany', handleExpandCompany);
    return () => {
      window.removeEventListener('expandWorkLedgerCompany', handleExpandCompany);
    };
  }, []);

  const scrollToAnchor = (anchor) => {
    if (!anchor) return;
    const element = document.querySelector(anchor);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      fastScrollTo(y, 200); // Fast scroll with 200ms duration
    }
  };

  const scrollToModelCard = (anchor, modelCardId) => {
    if (!anchor || !modelCardId) return;
    
    // Immediately find element and calculate position
    const element = document.querySelector(anchor);
    if (!element) return;
    
    // Calculate position immediately while element is stable
    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + (window.scrollY || window.pageYOffset);
    const yOffset = 100; // Navbar (80px) + padding (20px)
    const scrollY = absoluteTop - yOffset;
    
    // Start scroll immediately
    fastScrollTo(scrollY, 200);
    
    // Dispatch custom event to expand the card with skipAutoScroll flag
    // This prevents the duplicate scroll from the expansion handler
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('expandModelCard', { 
        detail: { cardId: modelCardId, skipAutoScroll: true } 
      }));
    }, 250);
  };

  const scrollToWorkLedger = () => {
    const element = document.querySelector('#work-ledger');
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      fastScrollTo(y, 200); // Fast scroll with 200ms duration
    }
  };

  return (
    <section id="work-ledger" className="min-h-screen px-4 sm:px-6 lg:px-8 py-20 sm:py-28 scroll-mt-20 bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
            Systems I've Owned
          </h1>
          <p className="text-lg sm:text-xl text-foreground/80 mb-8 max-w-3xl mx-auto">
            Where the systems I designed were applied. Each company represents real production deployments of the system designs shown above.
          </p>
        </motion.div>

        {/* Company Cards Grid */}
        <div className="space-y-6 mb-12">
          {workLedgerData.map((company, idx) => (
            <motion.div
              key={company.id}
              id={`work-ledger-company-${company.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              {/* Company Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => handleCompanyClick(company.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCompanyClick(company.id);
                  }
                }}
                className={`rounded-xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-300 cursor-pointer ${
                  expandedCompany === company.id 
                    ? 'border-primary/60 shadow-xl dark:shadow-[0_10px_50px_rgba(59,130,246,0.4)] dark:border-primary/80 dark:ring-2 dark:ring-primary/30' 
                    : 'border-border shadow-md hover:shadow-lg hover:-translate-y-1 dark:shadow-[0_4px_20px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_8px_30px_rgba(59,130,246,0.25)]'
                }`}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Building className="w-5 h-5 text-primary" />
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                          {company.companyName}
                        </h3>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
                          {company.roleTitle}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="text-base font-semibold text-foreground mb-2">Systems owned:</p>
                        <ul className="space-y-1">
                          {company.systems.slice(0, 3).map((system) => (
                            <li key={system.id} className="text-base text-muted-foreground flex items-start gap-2">
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                              <span>{system.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-base text-foreground/80">
                        {typeof company.impactSummary === 'object' && company.impactSummary.links ? (
                          (() => {
                            let text = company.impactSummary.text;
                            const parts = [];
                            let lastIndex = 0;
                            
                            // Find all link positions and sort by index
                            const linkPositions = company.impactSummary.links
                              .map(link => ({
                                link,
                                index: text.indexOf(link.text)
                              }))
                              .filter(pos => pos.index !== -1)
                              .sort((a, b) => a.index - b.index);
                            
                            linkPositions.forEach(({ link, index }) => {
                              // Add text before this link
                              if (index > lastIndex) {
                                parts.push({ type: 'text', content: text.substring(lastIndex, index) });
                              }
                              // Add the link
                              parts.push({ type: 'link', content: link.text, url: link.url });
                              lastIndex = index + link.text.length;
                            });
                            
                            // Add remaining text
                            if (lastIndex < text.length) {
                              parts.push({ type: 'text', content: text.substring(lastIndex) });
                            }
                            
                            return (
                              <>
                                {parts.map((part, idx) => 
                                  part.type === 'link' ? (
                                    <a
                                      key={idx}
                                      href={part.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline"
                                    >
                                      {part.content}
                                    </a>
                                  ) : (
                                    <span key={idx}>{part.content}</span>
                                  )
                                )}
                              </>
                            );
                          })()
                        ) : (
                          company.impactSummary
                        )}
                      </p>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedCompany === company.id ? 90 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0 mt-1"
                    >
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Panel */}
                <AnimatePresence>
                  {expandedCompany === company.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-6 border-t border-border pt-6">
                        {/* Systems List */}
                        <div>
                          <h4 className="text-xl font-bold text-foreground mb-4">ML Systems Owned</h4>
                          <div className="space-y-4">
                            {company.systems.map((system, index) => (
                              <div key={system.id} className="pb-4 border-b border-border/50 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-medium text-foreground mb-2">
                                      {index + 1}. {system.title}
                                    </p>
                                    <p className="text-base text-muted-foreground mb-3">
                                      Problem class: {system.problemClass}
                                    </p>
                                    {system.workBullets && system.workBullets.length > 0 && (
                                      <ul className="space-y-2 mb-3">
                                        {system.workBullets.map((bullet, bulletIdx) => (
                                          <li key={bulletIdx} className="text-base text-foreground/80 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                            <span>{bullet}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {system.modelCardAnchor && system.modelCardId && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          scrollToModelCard(system.modelCardAnchor, system.modelCardId);
                                        }}
                                        className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                                      >
                                        View Design Choices
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Deliverables */}
                        {company.deliverables && company.deliverables.length > 0 && (
                          <div>
                            <h5 className="font-semibold text-foreground mb-3">Deliverables</h5>
                            <ul className="space-y-2">
                              {company.deliverables.map((deliverable, index) => {
                                // Handle both string and object formats for deliverables
                                if (typeof deliverable === 'object' && deliverable.url) {
                                  // Extract the title from the text (the part in quotes)
                                  const titleMatch = deliverable.text.match(/'([^']+)'/);
                                  const title = titleMatch ? titleMatch[1] : deliverable.text;
                                  const beforeTitle = deliverable.text.split("'")[0];
                                  const afterTitle = deliverable.text.split("'")[2] || '';
                                  return (
                                    <motion.li 
                                      key={index} 
                                      className="text-base text-foreground/80 flex items-start gap-2"
                                      animate={{
                                        textShadow: [
                                          '0 0 0px rgba(59, 130, 246, 0)',
                                          '0 0 8px rgba(59, 130, 246, 0.5)',
                                          '0 0 0px rgba(59, 130, 246, 0)'
                                        ]
                                      }}
                                      transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: index * 0.3,
                                        ease: "easeInOut"
                                      }}
                                    >
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                      <span>
                                        {beforeTitle}
                                        <a 
                                          href={deliverable.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline"
                                        >
                                          '{title}'
                                        </a>
                                        {afterTitle}
                                      </span>
                                    </motion.li>
                                  );
                                }
                                return (
                                  <motion.li 
                                    key={index} 
                                    className="text-base text-foreground/80 flex items-start gap-2"
                                    animate={{
                                      textShadow: [
                                        '0 0 0px rgba(59, 130, 246, 0)',
                                        '0 0 8px rgba(59, 130, 246, 0.5)',
                                        '0 0 0px rgba(59, 130, 246, 0)'
                                      ]
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      delay: index * 0.3,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>{deliverable}</span>
                                  </motion.li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {/* Impact */}
                        <div>
                          <h5 className="font-semibold text-foreground mb-3">What changed because of this work</h5>
                          <ul className="space-y-2">
                            {company.impactBullets.map((bullet, index) => (
                              <li key={index} className="text-base text-foreground/80 flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Environment */}
                        <div>
                          <h5 className="font-semibold text-foreground mb-3">Environment</h5>
                          <div className="space-y-1">
                            {company.environment.map((env, index) => (
                              <p key={index} className="text-base text-muted-foreground">
                                {env}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Links */}
                        <div className="pt-4 border-t border-border flex flex-col sm:flex-row gap-4 justify-between items-start">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToWorkLedger();
                            }}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Back to My Work
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              scrollToAnchor('#concepts-portfolio');
                            }}
                            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                          >
                            View all design choices
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
