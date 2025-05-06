<!-- src/components/ScrollAnimation.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  
  // Animation options
  export let animation = 'fade-in'; // Options: fade-in, slide-up, slide-left, slide-right, zoom-in
  export let delay = 0; // Delay in ms
  export let duration = 800; // Duration in ms
  export let threshold = 0.2; // How much of element needs to be visible
  export let once = true; // Whether to run animation only once
  
  let element;
  let observer;
  let hasAnimated = false;
  let isVisible = false;
  
  onMount(() => {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible = true;
          
          if (once) {
            hasAnimated = true;
            observer.unobserve(element);
          }
        } else {
          if (!once && hasAnimated) {
            isVisible = false;
          }
        }
      });
    }, { 
      threshold: threshold
    });
    
    observer.observe(element);
    
    return () => {
      if (observer && element) {
        observer.unobserve(element);
      }
    };
  });
  
  onDestroy(() => {
    if (observer && element) {
      observer.unobserve(element);
    }
  });
  
  // Determine base classes based on animation type
  $: baseClasses = getBaseClasses(animation);
  
  // Determine animated classes when visible
  $: animatedClasses = isVisible ? 'opacity-100 translate-x-0 translate-y-0 scale-100' : '';
  
  function getBaseClasses(animationType) {
    // Default for all animations - will change opacity
    let classes = 'opacity-0 will-change-transform will-change-opacity';
    
    // Add specific transform based on animation type
    switch(animationType) {
      case 'slide-up':
        classes += ' translate-y-lg'; // Using your spacing scale
        break;
      case 'slide-left':
        classes += ' translate-x-lg'; // Using your spacing scale
        break;
      case 'slide-right':
        classes += ' -translate-x-lg'; // Using your spacing scale
        break;
      case 'zoom-in':
        classes += ' scale-90';
        break;
      // fade-in only needs opacity-0 which is already included
    }
    
    return classes;
  }
</script>

<div 
  bind:this={element} 
  class={`${baseClasses} ${animatedClasses} transition-all`}
  style={`transition-duration: ${duration}ms; transition-delay: ${delay}ms;`}
>
  <slot></slot>
</div>