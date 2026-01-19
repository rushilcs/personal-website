import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm here to answer questions about Rushil's experience, skills, and background. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const expandTimerRef = useRef(null);
  const collapseTimerRef = useRef(null);
  const hasExpandedRef = useRef(false);
  const fortyFiveSecondTimerRef = useRef(null);
  const aboutSectionExpandedRef = useRef(false);
  const aboutSectionObserverRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Expand chatbot a few seconds after "Generate 90 Days Plan" button is pressed
  useEffect(() => {
    const handleGeneratePlanPressed = () => {
      if (isOpen) {
        return; // Don't expand if already open
      }
      
      // Clear any existing timers
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
      if (fortyFiveSecondTimerRef.current) clearTimeout(fortyFiveSecondTimerRef.current); // Clear 45-second timer
      
      // Expand after 7 seconds, hold for 5 seconds, then collapse
      expandTimerRef.current = setTimeout(() => {
        setIsExpanded(true);
        hasExpandedRef.current = true; // Mark as expanded
        collapseTimerRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, 5000); // Hold for 5 seconds
      }, 7000); // Expand after 7 seconds
    };

    // Listen for the custom event
    window.addEventListener('generatePlanButtonPressed', handleGeneratePlanPressed);

    return () => {
      window.removeEventListener('generatePlanButtonPressed', handleGeneratePlanPressed);
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    };
  }, [isOpen]);

  // Auto-expand after 45 seconds if it hasn't already expanded and button hasn't been pressed
  useEffect(() => {
    if (isOpen) {
      return; // Don't set timer if already open
    }

    fortyFiveSecondTimerRef.current = setTimeout(() => {
      // Only expand if it hasn't already expanded from button press
      if (!hasExpandedRef.current) {
        setIsExpanded(true);
        hasExpandedRef.current = true; // Mark as expanded
        // Collapse after 5 seconds
        collapseTimerRef.current = setTimeout(() => {
          setIsExpanded(false);
        }, 5000);
      }
    }, 45000); // 45 seconds = 45000ms

    return () => {
      if (fortyFiveSecondTimerRef.current) clearTimeout(fortyFiveSecondTimerRef.current);
    };
  }, [isOpen]);

  // Auto-expand when user reaches About Me section (first time only)
  useEffect(() => {
    if (isOpen || aboutSectionExpandedRef.current) {
      return; // Don't set observer if already open or already expanded
    }

    const aboutSection = document.querySelector('#about-rushil');
    if (!aboutSection) {
      return;
    }

    // Use IntersectionObserver to detect when About section is visible
    aboutSectionObserverRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !aboutSectionExpandedRef.current && !hasExpandedRef.current) {
            // User has reached About section for the first time
            aboutSectionExpandedRef.current = true;
            setIsExpanded(true);
            hasExpandedRef.current = true; // Mark as expanded
            // Collapse after 5 seconds
            collapseTimerRef.current = setTimeout(() => {
              setIsExpanded(false);
            }, 5000);
          }
        });
      },
      {
        threshold: 0.3, // Trigger when 30% of section is visible
        rootMargin: '-80px 0px' // Account for navbar
      }
    );

    aboutSectionObserverRef.current.observe(aboutSection);

    return () => {
      if (aboutSectionObserverRef.current) {
        aboutSectionObserverRef.current.disconnect();
      }
    };
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to get response';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // If parsing fails, use the text as is
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I'm sorry, I encountered an error: ${error.message}. Please check that the server is running and try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 group z-50 cursor-pointer"
          aria-label="Open chatbot"
        >
          <div className={`w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-300 ease-out flex items-center overflow-hidden ${isExpanded ? 'w-[180px] justify-start pl-4' : 'justify-center group-hover:w-[180px] group-hover:rounded-full group-hover:justify-start group-hover:pl-4'}`}>
            <MessageSquare className="w-6 h-6 flex-shrink-0" />
            <span className={`text-sm font-medium whitespace-nowrap ml-3 ${isExpanded ? 'block' : 'hidden group-hover:block'}`}>
              Ask about Rushil
            </span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Ask About Me</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-background rounded transition-colors"
              aria-label="Close chatbot"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
