import { writable } from 'svelte/store';

// Create stores for state management
export const activeSection = writable('hero');
export const sections = writable(['hero', 'stakes', 'value-proposition', 'competency', 'plan', 'explain']);

// Scroll configuration (could be made writable if you want to change it)
export const scrollConfig = writable({
  offset: 80,
  duration: 150,
  easing: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
});

// Function to update the active section
export function setActiveSection(section) {
  activeSection.set(section);
  // Optionally update the URL hash
  history.pushState(null, null, `#${section}`);
}

// Smooth scroll helper function that can be imported by any component
export function smoothScrollTo(targetId, config) {
  const targetElement = document.getElementById(targetId);
  if (!targetElement) return;
  
  let scrollOffset;
  scrollConfig.subscribe(value => scrollOffset = value.offset)();
  
  const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - scrollOffset;
  performSmoothScroll(targetPosition, config);
  setActiveSection(targetId);
}

// Internal function for animation
function performSmoothScroll(targetY, config) {
  let duration, easing;
  const unsubscribe = scrollConfig.subscribe(value => {
    duration = config?.duration || value.duration;
    easing = config?.easing || value.easing;
  });
  unsubscribe();
  
  const startY = window.scrollY;
  const difference = targetY - startY;
  const startTime = performance.now();
  
  function step() {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easing(progress);
    
    window.scrollTo(0, startY + difference * easedProgress);
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  
  window.requestAnimationFrame(step);
}