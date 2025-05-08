<!-- src/components/LoadingAnimation.svelte -->
<script>
  import { onMount } from 'svelte';
  import { writable, derived } from 'svelte/store';
  import { quartOut } from 'svelte/easing';
  
  // Props with defaults
  export let duration = 600;
  export let loadingStages = [
    "Loading assets...",
    "Setting up the scene...",
    "Optimizing elements...", 
    "Preparing your experience...",
    "Initialization complete."
  ];
  export let skipForTesting = false;
  
  // State management
  let loading = true;
  let typewriterText = "";
  let fadeOutStarted = false;
  let contentVisible = false;
  
  // Progress store with built-in non-decreasing behavior
  const rawProgress = writable(0);
  const progress = derived(rawProgress, ($raw, set) => {
    const prev = progress.prev ?? 0;
    const newValue = Math.max(prev, $raw);
    set(newValue);
    progress.prev = newValue;
  }, 0);
  
  // Update text based on progress thresholds
  $: {
    const index = $progress < 0.25 ? 0 : 
                  $progress < 0.6 ? 1 : 
                  $progress < 0.8 ? 2 : 
                  $progress < 0.99 ? 3 : 4;
    typewriterText = loadingStages[index];
  }
  
  // Animate progress with easing
  function animateProgressTo(target, animDuration) {
    const start = progress.prev ?? 0;
    const startTime = performance.now();
    
    function update() {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / animDuration);
      
      rawProgress.set(start + (target - start) * quartOut(t));
      
      if (t < 1) requestAnimationFrame(update);
    }
    
    requestAnimationFrame(update);
  }
  
  // Handle 3D scene loaded event
  function handleThreeSceneLoaded() {
    if (progress.prev < 0.85) {
      animateProgressTo(0.85, Math.max(800, duration * 0.25));
    }
  }
  
  // Complete loading process with transition
  function finalizeLoading() {
    // Animate to completion
    animateProgressTo(1, Math.max(600, duration * 0.35));
    
    // Transition sequence
    const transitionDelay = Math.max(1200, duration * 0.2);
    
    setTimeout(() => {
      contentVisible = true;
      
      setTimeout(() => {
        fadeOutStarted = true;
        
        setTimeout(() => {
          loading = false;
        }, 1500);
      }, 200);
    }, transitionDelay);
  }
  
  // Initialize loading sequence
  function startLoading() {
    if (skipForTesting) {
      finalizeLoading();
      return;
    }
    
    const stages = [
      { target: 0.25, duration: duration * 0.4 },
      { target: 0.60, duration: duration * 0.5 },
      { target: 0.80, duration: duration * 0.6 },
      { target: 0.99, duration: duration * 0.9 }
    ];
    
    let delay = 500;
    
    stages.forEach((stage, i) => {
      setTimeout(() => {
        animateProgressTo(stage.target, stage.duration);
        
        // Start finalizing after last stage
        if (i === stages.length - 1) {
          setTimeout(() => finalizeLoading(), duration * 0.5);
        }
      }, delay);
      
      delay += stage.duration * 0.7;
    });
  }
  
  onMount(() => {
    // Notify that loading component is ready
    window.dispatchEvent(new CustomEvent('loadingReady'));
    
    // Start loading sequence
    startLoading();
    
    // Listen for ThreeScene load event
    window.addEventListener('threeSceneLoaded', handleThreeSceneLoaded);
    
    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (progress.prev < 1) finalizeLoading();
    }, duration * 1.5);
    
    return () => {
      clearTimeout(safetyTimeout);
      window.removeEventListener('threeSceneLoaded', handleThreeSceneLoaded);
    };
  });
</script>

<div 
  class="fixed inset-0 flex flex-col justify-center items-center z-[9999] transition-all duration-1500 ease-out"
  class:opacity-0={fadeOutStarted} 
  class:pointer-events-none={fadeOutStarted}
  style="background-color: rgba(0, 0, 0, 0.9); backdrop-filter: blur(20px);"
>
  <!-- Loading Container -->
  <div class="bg-background py-4 px-6 rounded-md shadow-md z-10 border border-accent-two/75 overflow-hidden transition-opacity duration-800 flex flex-col items-left" 
       style="opacity: {fadeOutStarted ? 0 : 1}">
    <!-- Status Text -->
    <div class="z-10 text-left mb-md">
      <div class="font-sans text-left text-large text-accent-two font-semibold">
        {typewriterText}<span class="inline-block w-2 h-5 bg-accent-two ml-1 animate-[blink_0.9s_steps(1)_infinite]"></span>
      </div>
      <p class="text-accent-two/80 text-small text-right">{Math.round($progress * 100)}%</p>
    </div>
    
    <!-- Loading Bar -->
    <div class="w-[70vw] max-w-md h-5 bg-text/5 rounded-sm overflow-hidden relative shadow-inner">
      <!-- Progress Bar -->
      <div 
        class="h-full rounded-sm bg-gradient-to-r from-accent-two/90 to-accent-two"
        style="width: {$progress * 100}%; transition: width 3000ms cubic-bezier(0.25, 1, 0.5, 1);"
      >
        <!-- Shimmer Effect -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_5s_ease-in-out_infinite] w-[200%]"></div>
        </div>
      </div>
      
      <!-- Edge Pulse -->
      <div 
        class="absolute top-0 h-full pointer-events-none"
        style="left: {Math.max(0, $progress * 100 - 2)}%; width: {Math.min(10, 10 * $progress)}%; transition: left 3000ms cubic-bezier(0.25, 1, 0.5, 1), width 3000ms cubic-bezier(0.25, 1, 0.5, 1);"
      >
        <div class="h-full w-full bg-gradient-to-r from-accent-two via-accent to-transparent"></div>
      </div>
    </div>
  </div>
  
  <style>
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(50%); }
    }
    
    @keyframes blink {
      0% { opacity: 1; }
      50% { opacity: 0; }
      100% { opacity: 1; }
    }
  </style>
</div>

<!-- Content Container -->
<div 
  class="transition-all duration-1500 ease-in-out"
  class:opacity-0={!contentVisible}
  class:opacity-100={contentVisible}
  style={loading ? 'visibility: visible;' : ''}
>
  <slot></slot>
</div>