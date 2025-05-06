<script>
  import { onMount, onDestroy } from 'svelte';
  import { sections, setActiveSection, scrollConfig } from '../stores/scrollStore';
  
  let sectionsList = [];
  let offset = 0;
  
  // Subscribe to stores
  const unsubSections = sections.subscribe(value => {
    sectionsList = value;
  });
  
  const unsubConfig = scrollConfig.subscribe(value => {
    offset = value.offset;
  });
  
  // Setup intersection observers for sections
  function setupIntersectionObservers() {
    // Options for the intersection observer
    const options = {
      root: null, // Use the viewport
      rootMargin: `-${offset}px 0px -50% 0px`, // Adjust based on your header offset
      threshold: 0.1 // Trigger when 10% of the section is visible
    };
    
    // Create the observer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, options);
    
    // Observe each section
    sectionsList.forEach(section => {
      const element = document.getElementById(section);
      if (element) observer.observe(element);
    });
    
    // Return cleanup function
    return () => {
      sectionsList.forEach(section => {
        const element = document.getElementById(section);
        if (element) observer.unobserve(element);
      });
      observer.disconnect();
    };
  }
  
  let cleanup;
  
  onMount(() => {
    // Setup intersection observers
    cleanup = setupIntersectionObservers();
    
    // Handle initial hash in URL if needed
    if (window.location.hash) {
      const sectionId = window.location.hash.substring(1);
      if (sectionsList.includes(sectionId)) {
        setActiveSection(sectionId);
      }
    }
  });
  
  onDestroy(() => {
    unsubSections();
    unsubConfig();
    if (cleanup) cleanup();
  });
</script>