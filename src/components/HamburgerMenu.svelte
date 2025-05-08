<script>
  import { onMount, onDestroy } from 'svelte';
  import { activeSection, smoothScrollTo } from '../stores/scrollStore';
  import { slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  
  // Array of navigation links
  export let links = [];
  
  // State for menu open/closed
  let isOpen = false;
  
  // Track current active section
  let currentSection;
  
  // Subscribe to active section changes
  const unsubActiveSection = activeSection.subscribe(value => {
    currentSection = value;
  });
  
  // Toggle function
  function toggleMenu() {
    isOpen = !isOpen;
    // When the menu is open, prevent scrolling on the body
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }
  
  // Handle click on navigation links
  function handleNavClick(e, href) {
    e.preventDefault();
    
    // Extract section ID from href
    const sectionId = href.replace('#', '');
    
    // First initiate smooth scroll to the section
    smoothScrollTo(sectionId);
    
    // Then close the menu
    toggleMenu();
  }
  
  // Close menu when clicking outside or pressing ESC
  function handleClickOutside(event) {
    const menu = document.querySelector('.mobile-menu-container');
    const hamburger = document.getElementById('hamburger');
    
    if (isOpen && menu && hamburger && !menu.contains(event.target) && !hamburger.contains(event.target)) {
      toggleMenu();
    }
  }
  
  function handleKeydown(event) {
    if (isOpen && event.key === 'Escape') {
      toggleMenu();
    }
  }
  
  // Add and remove event listeners
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
    document.removeEventListener('keydown', handleKeydown);
    // Clean up subscription
    unsubActiveSection();
    // Make sure to remove the class when component is destroyed
    document.body.classList.remove('overflow-hidden');
  });
  
  // Function to check if a link is active
  function isActive(href) {
    const section = href.replace('#', '');
    return currentSection === section;
  }
</script>

  <!-- The entire hamburger menu component -->
  <div class="hamburger-container">
    <!-- Hamburger Button that transforms to X -->
    <button 
      id="hamburger"
      aria-label={isOpen ? 'Close menu' : 'Open menu'} 
      aria-expanded={isOpen} 
      class="flex flex-col justify-left items-left w-10 h-10 cursor-pointer z-[100] focus:outline-none fixed top-4 left-4"
      on:click={toggleMenu}
    >
      <span class:transformed={isOpen} class="hamburger-line"></span>
      <span class:transformed={isOpen} class="hamburger-line"></span>
      <span class:transformed={isOpen} class="hamburger-line"></span>
    </button>
    
    <!-- Mobile Menu - conditionally rendered based on isOpen state with transition -->
    {#if isOpen}
      <div 
        transition:slide={{duration: 600, easing: quintOut}}
        class="mobile-menu-container fixed top-0 left-0 w-[200 px] h-auto bg-background/95 backdrop-blur-md z-[90] overflow-y-auto rounded-b-[clamp(8px,3vw,16px)] border-b border-x border-text/10"
      >
        <div class="p-md pt-[50px] relative">
          <div class="flex flex-col w-full gap-3 py-4 mx-auto text-left">
            {#each links as link}
              <a 
                href={link.href} 
                class="mobile-nav-link text-xl font-medium py-4 border-b border-text/10 hover:text-accent-two hover:border-accent-two transition-colors text-left {isActive(link.href) ? 'text-accent-two border-accent-two' : ''}" 
                on:click={(e) => handleNavClick(e, link.href)}
              >
                {link.text}
              </a>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>

  <style>
    /* Hamburger button styling */
    .hamburger-line {
      @apply block w-6 h-0.5 bg-text mb-1.5 transition-all duration-300 ease-in-out;
    }
    
    /* Animation styles for hamburger lines */
    .hamburger-line.transformed:nth-child(1) {
      @apply translate-y-2 rotate-45 bg-accent-two;
    }
    
    .hamburger-line.transformed:nth-child(2) {
      @apply opacity-0;
    }
    
    .hamburger-line.transformed:nth-child(3) {
      @apply -translate-y-2 -rotate-45 bg-accent-two;
    }
    
    /* Mobile nav link hover effect */
    .mobile-nav-link:hover {
      color: var(--color-accent-two, #187B43);
    }
    
    /* Mobile menu container shadow */
    .mobile-menu-container {
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    
    /* For small screens, adjust width to be full-width but with a max */
    @media (max-width: 400px) {
      .mobile-menu-container {
        width: 100%;
        max-width: 350px;
      }
    }
  </style>