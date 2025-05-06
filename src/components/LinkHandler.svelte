<script>
    import { onMount, onDestroy } from 'svelte';
    import { smoothScrollTo } from '../stores/scrollStore';
    
    // Handle click on anchor links
    function handleClick(event) {
      // Only process anchor links
      const href = event.currentTarget.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      event.preventDefault();
      
      // Get the target element
      const targetId = href.substring(1);
      smoothScrollTo(targetId);
    }
    
    onMount(() => {
      // Find all anchor links in the document
      const links = document.querySelectorAll('a[href^="#"]');
      
      // Add click handlers to anchor links (except scroll-indicator and mobile menu toggle)
      links.forEach(link => {
        if (!link.closest('.scroll-indicator') && !link.closest('#mobile-menu-toggle')) {
          link.addEventListener('click', handleClick);
        }
      });
      
      return () => {
        // Clean up event listeners
        links.forEach(link => {
          if (!link.closest('.scroll-indicator') && !link.closest('#mobile-menu-toggle')) {
            link.removeEventListener('click', handleClick);
          }
        });
      };
    });
  </script>