<script>
  import { fly } from 'svelte/transition';

  // ── Route map — single source of truth for navigation targets ────────
  const solutions = [
    { label: 'Backroom Automation', href: '/solutions/backroom-automation' },
    { label: 'Inventory Intelligence', href: '/solutions/inventory-intelligence' },
    { label: 'Operational Diagnostic', href: '/solutions/operational-diagnostic' },
  ];

  const industries = [
    { label: 'Retail', href: '/industries/retail' },
    { label: 'Distribution', href: '/industries/distribution' },
    { label: 'Wholesale', href: '/industries/wholesale' },
    { label: 'Pharmacy', href: '/industries/pharmacy' },
    { label: 'Multi-location Operations', href: '/industries/multi-location' },
  ];

  const links = [
    { label: 'About', href: '/about' },
    { label: 'Insights', href: '/insights' },
    { label: 'Contact', href: '/contact' },
  ];

  const cta = { label: 'Book a Demo', href: '/book-a-demo' };

  const dropdowns = [
    { id: 'solutions', label: 'Solutions', items: solutions },
    { id: 'industries', label: 'Industries', items: industries },
  ];

  // ── Motion — mirrors GUA-509 tailwind tokens (duration-base 250ms, ease-out-expo) ──
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t;
    const sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    const solve = (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) {
        const err = sx(t) - x;
        if (Math.abs(err) < 1e-6) return t;
        const d = dx(t);
        if (Math.abs(d) < 1e-6) break;
        t -= err / d;
      }
      return t;
    };
    return (x) => sy(solve(x));
  }

  const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);
  const menuTransition = { y: -8, duration: 250, easing: easeOutExpo };

  // ── State ────────────────────────────────────────────────────────────
  let openId = $state(null);
  let mobileOpen = $state(false);

  const canHover = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function open(id) {
    openId = id;
  }
  function close() {
    openId = null;
  }
  function toggle(id) {
    openId = openId === id ? null : id;
  }
  function onEnter(id) {
    if (canHover()) open(id);
  }
  function onLeave() {
    if (canHover()) close();
  }
  function onFocusOut(e, id) {
    if (openId !== id) return;
    if (!e.currentTarget.contains(e.relatedTarget)) close();
  }

  function toggleMobile() {
    mobileOpen = !mobileOpen;
    document.body.classList.toggle('overflow-hidden', mobileOpen);
  }
  function closeMobile() {
    mobileOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  $effect(() => {
    const openIdNow = openId;
    const mobileOpenNow = mobileOpen;

    function onPointerDown(e) {
      if (openIdNow) {
        const trigger = document.getElementById(`dropdown-trigger-${openIdNow}`);
        const panel = document.getElementById(`dropdown-panel-${openIdNow}`);
        const t = e.target;
        if (!(trigger && trigger.contains(t)) && !(panel && panel.contains(t))) {
          close();
        }
      }
      if (mobileOpenNow) {
        const trigger = document.getElementById('mobile-menu-trigger');
        const panel = document.getElementById('mobile-menu-panel');
        const t = e.target;
        if (!(trigger && trigger.contains(t)) && !(panel && panel.contains(t))) {
          closeMobile();
        }
      }
    }

    function onKeydown(e) {
      if (e.key !== 'Escape') return;
      if (openIdNow) {
        const trigger = document.getElementById(`dropdown-trigger-${openIdNow}`);
        close();
        trigger?.focus();
      }
      closeMobile();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeydown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeydown);
      document.body.classList.remove('overflow-hidden');
    };
  });

  const mobileLink =
    'block rounded-md -ml-2 px-2 py-sm text-body font-medium text-text hover:bg-texture-1 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
</script>

<nav class="flex items-center" aria-label="Primary">
  <!-- Desktop navigation -->
  <div class="hidden md:flex items-center gap-md">
    {#each dropdowns as dd}
      <div
        class="relative"
        onmouseenter={() => onEnter(dd.id)}
        onmouseleave={onLeave}
        onfocusout={(e) => onFocusOut(e, dd.id)}
      >
        <button
          id={`dropdown-trigger-${dd.id}`}
          type="button"
          class="inline-flex items-center gap-1 rounded-md px-sm py-xs text-sm font-medium text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors duration-fast"
          aria-haspopup="true"
          aria-expanded={openId === dd.id}
          aria-controls={`dropdown-panel-${dd.id}`}
          onclick={() => toggle(dd.id)}
        >
          {dd.label}
          <svg
            class="w-4 h-4 transition-transform duration-fast {openId === dd.id ? 'rotate-180' : ''}"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
          </svg>
        </button>

        {#if openId === dd.id}
          <div
            id={`dropdown-panel-${dd.id}`}
            class="absolute left-0 top-full mt-xs w-72 rounded-md border border-text/10 bg-white py-xs shadow-xl"
            transition:fly={menuTransition}
          >
            <ul>
              {#each dd.items as item}
                <li>
                  <a
                    href={item.href}
                    class="block rounded-md px-md py-sm text-sm text-muted hover:bg-texture-1 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors duration-fast"
                    onclick={close}
                    >{item.label}</a
                  >
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/each}

    {#each links as link}
      <a
        href={link.href}
        class="rounded-md px-sm py-xs text-sm font-medium text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 transition-colors duration-fast"
        >{link.label}</a
      >
    {/each}
  </div>

  <!-- Mobile toggle -->
  <button
    id="mobile-menu-trigger"
    type="button"
    class="md:hidden inline-flex items-center justify-center w-10 h-10 -mr-2 rounded-md text-text hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-colors duration-fast"
    aria-expanded={mobileOpen}
    aria-controls="mobile-menu-panel"
    aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
    onclick={toggleMobile}
  >
    {#if mobileOpen}
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="6" y1="6" x2="18" y2="18" />
        <line x1="18" y1="6" x2="6" y2="18" />
      </svg>
    {:else}
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <line x1="4" y1="7" x2="20" y2="7" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="17" x2="20" y2="17" />
      </svg>
    {/if}
  </button>

  <!-- Mobile menu -->
  {#if mobileOpen}
    <div
      id="mobile-menu-panel"
      class="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-text/10 bg-white shadow-xl md:hidden"
      transition:fly={menuTransition}
    >
      <div class="container py-md flex flex-col gap-lg">
        <div class="flex flex-col gap-md">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-xs">Solutions</p>
            <ul class="flex flex-col">
              {#each solutions as item}
                <li>
                  <a href={item.href} onclick={closeMobile} class={mobileLink}>{item.label}</a>
                </li>
              {/each}
            </ul>
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-xs">Industries</p>
            <ul class="flex flex-col">
              {#each industries as item}
                <li>
                  <a href={item.href} onclick={closeMobile} class={mobileLink}>{item.label}</a>
                </li>
              {/each}
            </ul>
          </div>
          <ul class="flex flex-col">
            {#each links as link}
              <li>
                <a href={link.href} onclick={closeMobile} class={mobileLink}>{link.label}</a>
              </li>
            {/each}
          </ul>
        </div>
        <a href={cta.href} onclick={closeMobile} class="btn btn-primary w-full">{cta.label}</a>
      </div>
    </div>
  {/if}
</nav>