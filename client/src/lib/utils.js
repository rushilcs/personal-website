import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => {
  return twMerge(clsx(inputs));
};

// Track ongoing scroll animation to cancel if needed
let ongoingScrollAnimation = null;
let scrollStartY = null;
let scrollTargetY = null;

// Fast scroll function - much faster than default smooth scroll
export const fastScrollTo = (targetY, duration = 200) => {
  // Cancel any ongoing scroll animation
  if (ongoingScrollAnimation) {
    cancelAnimationFrame(ongoingScrollAnimation);
    ongoingScrollAnimation = null;
  }

  // Stop any native smooth scrolling immediately
  window.scrollTo({
    top: window.scrollY,
    behavior: 'auto'
  });

  // Small delay to ensure browser has stopped any native scrolling
  requestAnimationFrame(() => {
    const startY = window.scrollY || window.pageYOffset;
    const distance = targetY - startY;
    
    // If distance is very small, just scroll directly
    if (Math.abs(distance) < 5) {
      window.scrollTo(0, targetY);
      return;
    }
    
    const startTime = performance.now();

    const animateScroll = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out cubic function for smooth but fast animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentY = startY + distance * easeOutCubic;
      
      window.scrollTo(0, currentY);
      
      if (progress < 1) {
        ongoingScrollAnimation = requestAnimationFrame(animateScroll);
      } else {
        // Ensure we end exactly at target
        window.scrollTo(0, targetY);
        ongoingScrollAnimation = null;
      }
    };

    ongoingScrollAnimation = requestAnimationFrame(animateScroll);
  });
};
