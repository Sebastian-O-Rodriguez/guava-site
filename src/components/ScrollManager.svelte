<script>
  import { onMount, onDestroy } from 'svelte';
  import { scrollConfig } from '../stores/scrollStore';
  import ScrollBehavior from './ScrollBehavior.svelte';
  import ScrollIndicator from './ScrollIndicator.svelte';
  import LinkHandler from './LinkHandler.svelte';
  
  // Component props
  export let offset = 80;
  export let duration = 150;
  
  onMount(() => {
    // Update scroll configuration
    scrollConfig.update(config => ({
      ...config,
      offset,
      duration
    }));
  });
</script>

<ScrollBehavior />
<ScrollIndicator />
<LinkHandler />