<script>
  import { activeSection, sections, smoothScrollTo } from '../stores/scrollStore';
  
  // Store reactive values
  let currentSection;
  let sectionsList = [];
  
  // Subscribe to stores
  const unsubActive = activeSection.subscribe(value => {
    currentSection = value;
  });
  
  const unsubSections = sections.subscribe(value => {
    sectionsList = value;
  });
  
  // Function to handle dot click
  function handleDotClick(e, section) {
    e.preventDefault();
    smoothScrollTo(section);
  }
  
  // Clean up subscriptions
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    unsubActive();
    unsubSections();
  });
</script>

<div class="scroll-indicator-container">
  {#each sectionsList as section}
    <a 
      href={`#${section}`}
      aria-label={`Scroll to ${section} section`}
      class="scroll-indicator-dot {currentSection === section ? 'active' : ''}"
      on:click={(e) => handleDotClick(e, section)}
    ></a>
  {/each}
</div>