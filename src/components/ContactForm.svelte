<!-- src/components/ContactForm.svelte -->
<script>
  import { onMount } from 'svelte';
  
  let name = '';
  let email = '';
  let message = '';
  let submitting = false;
  let submitted = false;
  let error = null;
  
  let nameError = '';
  let emailError = '';
  let messageError = '';
  
  onMount(() => {
    // You can initialize form elements or connect to external services here
  });
  
  function validateForm() {
    let isValid = true;
    
    // Reset errors
    nameError = '';
    emailError = '';
    messageError = '';
    
    // Validate name
    if (!name.trim()) {
      nameError = 'Name is required';
      isValid = false;
    }
    
    // Validate email
    if (!email.trim()) {
      emailError = 'Email is required';
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      emailError = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Validate message
    if (!message.trim()) {
      messageError = 'Message is required';
      isValid = false;
    } else if (message.length < 10) {
      messageError = 'Message must be at least 10 characters';
      isValid = false;
    }
    
    return isValid;
  }
  
  async function handleSubmit() {
    if (!validateForm()) {
      return;
    }
    
    submitting = true;
    error = null;
    
    try {
      // You would replace this with your actual API call
      // For example, using fetch to submit to a form endpoint:
      /*
      const response = await fetch('https://your-form-endpoint.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit form');
      }
      */
      
      // For now, we'll simulate a successful submission after 1 second
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form on success
      name = '';
      email = '';
      message = '';
      submitted = true;
      
      // Reset submitted state after 5 seconds
      setTimeout(() => {
        submitted = false;
      }, 5000);
      
    } catch (err) {
      console.error('Form submission error:', err);
      error = 'There was an error submitting your message. Please try again.';
    } finally {
      submitting = false;
    }
  }
</script>
<section id="contact" class="section-wrapper">
  <div class="container">
    <div class="content-container">
      <h2 class="section-header text-center">Contact Me</h2>
    
      {#if submitted}
        <div class="bg-accent/20 text-accent p-lg rounded-lg text-center">
          <h3 class="text-h3 font-semibold mb-sm">Thank you for your message!</h3>
          <p>I'll get back to you as soon as possible.</p>
        </div>
      {:else}
        <form on:submit|preventDefault={handleSubmit}>
          <div class="mb-md">
            <label for="name" class="block mb-xs font-semibold">Name</label>
            <input
              type="text"
              id="name"
              bind:value={name}
              class={`w-full px-sm py-sm border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${nameError ? 'border-red-500' : 'border-white/10'} bg-white/5`}
              disabled={submitting}
            />
            {#if nameError}
              <span class="text-red-500 text-small mt-xs block">{nameError}</span>
            {/if}
          </div>
          
          <div class="mb-md">
            <label for="email" class="block mb-xs font-semibold">Email</label>
            <input
              type="email"
              id="email"
              bind:value={email}
              class={`w-full px-sm py-sm border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${emailError ? 'border-red-500' : 'border-white/10'} bg-white/5`}
              disabled={submitting}
            />
            {#if emailError}
              <span class="text-red-500 text-small mt-xs block">{emailError}</span>
            {/if}
          </div>
          
          <div class="mb-md">
            <label for="message" class="block mb-xs font-semibold">Message</label>
            <textarea
              id="message"
              rows="5"
              bind:value={message}
              class={`w-full px-sm py-sm border rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent ${messageError ? 'border-red-500' : 'border-white/10'} bg-white/5`}
              disabled={submitting}
            ></textarea>
            {#if messageError}
              <span class="text-red-500 text-small mt-xs block">{messageError}</span>
            {/if}
          </div>
          
          {#if error}
            <div class="bg-red-500/20 text-red-400 p-sm rounded-md mb-md">
              <p>{error}</p>
            </div>
          {/if}
          
          <button 
            type="submit" 
            disabled={submitting}
            class={`btn ${submitting ? 'bg-secondary/50 cursor-not-allowed' : 'btn-primary'}`}
          >
            {#if submitting}
              Sending...
            {:else}
              Send Message
            {/if}
          </button>
        </form>
      {/if}
    </div>
  </div>
</section>