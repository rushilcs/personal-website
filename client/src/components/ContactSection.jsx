import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Linkedin, Mail } from 'lucide-react';

// Contact information config
const contactInfo = {
  email: 'rushilcs@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rushil-c/',
};

export const ContactSection = () => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  const handleCopyEmail = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(contactInfo.email);
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 1500);
      } else {
        // Fallback: use hidden textarea method
        const textarea = document.createElement('textarea');
        textarea.value = contactInfo.email;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 99999); // For mobile devices
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setCopyError(false);
          setTimeout(() => setCopied(false), 1500);
        } catch (err) {
          setCopyError(true);
          setTimeout(() => setCopyError(false), 2000);
        } finally {
          document.body.removeChild(textarea);
        }
      }
    } catch (err) {
      // If clipboard API fails, try fallback
      const textarea = document.createElement('textarea');
      textarea.value = contactInfo.email;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      document.body.appendChild(textarea);
      textarea.select();
      textarea.setSelectionRange(0, 99999);
      
      try {
        document.execCommand('copy');
        setCopied(true);
        setCopyError(false);
        setTimeout(() => setCopied(false), 1500);
      } catch (fallbackErr) {
        setCopyError(true);
        setTimeout(() => setCopyError(false), 2000);
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 scroll-mt-20">
      <div className="container max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="border-t border-border/40 pt-8 mt-4"
        >
          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground mb-8">
            Contact
          </h2>

          {/* Contact Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-y-4 gap-x-6">
            {/* Email Row */}
            <div className="text-sm text-muted-foreground flex items-center">
              Email
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={`mailto:${contactInfo.email}`}
                className="text-base sm:text-lg text-foreground/80 hover:text-primary transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>{contactInfo.email}</span>
              </a>
              <button
                onClick={handleCopyEmail}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCopyEmail(e);
                  }
                }}
                className="text-sm px-3 py-1 rounded-md border border-border/50 hover:border-border hover:bg-foreground/5 transition-all duration-200 flex items-center gap-1.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                aria-label="Copy email address"
                title="Copy email address"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-green-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              {copyError && (
                <span className="text-xs text-muted-foreground">
                  Copy failed - use mailto link
                </span>
              )}
            </div>

            {/* LinkedIn Row */}
            <div className="text-sm text-muted-foreground flex items-center">
              LinkedIn
            </div>
            <div className="flex items-center">
              <a
                href={contactInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base sm:text-lg text-foreground/80 hover:text-primary transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 rounded"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
