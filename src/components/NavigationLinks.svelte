<script>
    import { activeSection } from '../stores/scrollStore';
    
    // Accept links as a prop
    export let links;
    
    let currentSection;
    
    // Subscribe to the active section store
    activeSection.subscribe(value => {
      currentSection = value;
    });
    
    // Function to determine if a link should be styled as active
    function isActive(href) {
      const section = href.replace('#', '');
      return currentSection === section;
    }
  </script>
  
  <div class="hidden lg:flex items-center gap-x-6">
    {#each links.slice(0, -1) as link}
      <a 
        href={link.href} 
        class="transition-colors text-base {isActive(link.href) ? 'text-accent font-medium' : 'hover:text-accent'}"
      >
        {link.text}
      </a>
    {/each}
    
    <!-- Contact button has special styling -->
    <a 
      href={links[links.length - 1].href} 
      class="btn btn-primary text-base {isActive(links[links.length - 1].href) ? 'bg-accent/90 shadow-md' : ''}"
    >
      {links[links.length - 1].text}
    </a>
  </div>