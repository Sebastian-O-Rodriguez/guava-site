<script>
  let {
    items = [],
    idPrefix = 'explorer',
    label = 'Items',
  } = $props();

  let active = $state(items[0]?.id ?? '');
  const activeIndex = $derived(Math.max(0, items.findIndex((i) => i.id === active)));
  const activeItem = $derived(items[activeIndex]);

  // Brand palette mirrored from tailwind.config.js tokens (SVG visuals).
  const CO = {
    brand: '#187B43',
    brand600: '#126637',
    brand200: '#A4DABD',
    brand100: '#D2EDDC',
    brand50: '#EBF7EF',
    text: '#2C2828',
    secondary: '#343A34',
    muted: '#6B6F6A',
    line: '#E3E8E0',
    surface: '#FFFFFF',
  };

  function select(index) {
    const item = items[index];
    if (!item) return;
    active = item.id;
  }

  function handleKeydown(e) {
    const count = items.length;
    if (count < 2) return;
    let next = null;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = activeIndex + 1;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        next = activeIndex - 1;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    next = (next + count) % count;
    active = items[next].id;
    document.getElementById(`${idPrefix}-tab-${items[next].id}`)?.focus();
  }

  const pad = (n) => String(n + 1).padStart(2, '0');
</script>

{#snippet node(text, variant = 'step')}
  <span
    class={variant === 'source'
      ? 'inline-flex max-w-full items-center justify-center rounded-md border border-text/15 bg-white px-3 py-1.5 text-center text-sm font-medium text-text'
      : variant === 'brand'
        ? 'inline-flex max-w-full items-center justify-center rounded-md border border-brand/25 bg-brand-50 px-3 py-1.5 text-center text-sm font-semibold text-brand-700'
        : variant === 'accent'
          ? 'inline-flex max-w-full items-center justify-center rounded-md bg-brand px-3 py-1.5 text-center text-sm font-semibold text-white'
          : 'inline-flex max-w-full items-center justify-center rounded-md border border-dashed border-text/30 bg-white/80 px-3 py-1.5 text-center text-sm font-medium text-muted'}
  >
    {text}
  </span>
{/snippet}

{#snippet downArrow()}
  <svg
    class="h-4 w-4 shrink-0 text-brand/70"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14M6 13l6 6 6-6" />
  </svg>
{/snippet}

{#snippet pipelinesFlow()}
  <div class="flex flex-col items-center gap-sm">
    <div class="flex flex-wrap items-center justify-center gap-xs">
      {@render node('POS', 'source')}
      {@render node('ERP', 'source')}
      {@render node('CSV', 'source')}
    </div>
    {@render downArrow()}
    {@render node('Unified operational model', 'brand')}
    {@render downArrow()}
    <div class="flex flex-wrap items-center justify-center gap-xs">
      {@render node('Reporting', 'source')}
      {@render node('Application layer', 'accent')}
    </div>
  </div>
{/snippet}

{#snippet automationFlow()}
  <div class="flex flex-col items-center gap-xs">
    {@render node('Input / document', 'source')}
    {@render downArrow()}
    {@render node('Validate', 'brand')}
    {@render downArrow()}
    <div class="flex w-full items-start justify-center gap-md">
      <div class="flex flex-col items-center gap-xs">
        {@render node('Processed automatically', 'accent')}
      </div>
      <div class="flex flex-col items-center gap-xs">
        {@render node('Route exception to operator', 'dashed')}
      </div>
    </div>
  </div>
{/snippet}

{#snippet decisionLoop()}
  <div class="flex flex-col items-center gap-xs">
    {@render node('Signal detected', 'source')}
    {@render downArrow()}
    {@render node('Context assembled', 'brand')}
    {@render downArrow()}
    {@render node('Decision', 'accent')}
    {@render downArrow()}
    {@render node('System updated', 'brand')}
  </div>
{/snippet}

{#snippet dashboardsSvg()}
  <svg viewBox="0 0 520 360" class="w-full h-auto" role="presentation" aria-hidden="true">
    <rect x="32" y="36" width="140" height="72" rx="10" fill={CO.surface} stroke={CO.line} stroke-width="2" />
    <rect x="48" y="56" width="44" height="8" rx="4" fill={CO.line} />
    <rect x="48" y="76" width="76" height="12" rx="6" fill={CO.brand} />
    <rect x="190" y="36" width="140" height="72" rx="10" fill={CO.surface} stroke={CO.line} stroke-width="2" />
    <rect x="206" y="56" width="44" height="8" rx="4" fill={CO.line} />
    <rect x="206" y="76" width="58" height="12" rx="6" fill={CO.brand200} />
    <rect x="348" y="36" width="140" height="72" rx="10" fill={CO.surface} stroke={CO.line} stroke-width="2" />
    <rect x="364" y="56" width="44" height="8" rx="4" fill={CO.line} />
    <rect x="364" y="76" width="88" height="12" rx="6" fill={CO.brand} />
    <rect x="32" y="140" width="296" height="184" rx="12" fill={CO.surface} stroke={CO.line} stroke-width="2" />
    <path d="M52 160 H308 M52 216 H308 M52 272 H308" stroke={CO.line} stroke-width="1.5" stroke-dasharray="4 6" />
    <polyline points="72,252 128,220 184,236 240,196 296,176" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="296" cy="176" r="5" fill={CO.brand} />
    <rect x="348" y="140" width="140" height="184" rx="12" fill={CO.surface} stroke={CO.line} stroke-width="2" />
    <rect x="368" y="252" width="20" height="56" rx="4" fill={CO.brand200} />
    <rect x="396" y="224" width="20" height="84" rx="4" fill={CO.brand} />
    <rect x="424" y="240" width="20" height="68" rx="4" fill={CO.brand100} />
    <rect x="450" y="204" width="20" height="104" rx="4" fill={CO.brand} />
  </svg>
{/snippet}

{#snippet pulseSvg()}
  <svg viewBox="0 0 520 360" class="w-full h-auto" role="presentation" aria-hidden="true">
    <path d="M40 90 H480 M40 180 H480 M40 270 H480" stroke={CO.line} stroke-width="1.5" stroke-dasharray="4 6" />
    <line x1="40" y1="180" x2="480" y2="180" stroke={CO.brand100} stroke-width="1.5" stroke-dasharray="2 6" />
    <polyline points="40,180 126,180 148,136 172,232 196,150 224,210 252,180 300,180 322,116 348,250 372,168 398,208 426,180 480,180" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="322" cy="116" r="7" fill={CO.surface} stroke={CO.brand600} stroke-width="3" />
    <circle cx="322" cy="116" r="16" fill="none" stroke={CO.brand200} stroke-width="2" opacity="0.7" />
    <circle cx="348" cy="250" r="7" fill={CO.surface} stroke={CO.brand600} stroke-width="3" />
    <circle cx="348" cy="250" r="14" fill="none" stroke={CO.brand200} stroke-width="2" opacity="0.5" />
    <path d="M30 92 L46 108 L62 92" fill="none" stroke={CO.muted} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet automationSvg()}
  <svg viewBox="0 0 520 360" class="w-full h-auto" role="presentation" aria-hidden="true">
    <g opacity="0.55">
      <rect x="36" y="52" width="150" height="44" rx="10" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
      <rect x="52" y="66" width="24" height="16" rx="3" fill="none" stroke={CO.muted} stroke-width="2" />
      <rect x="82" y="66" width="24" height="16" rx="3" fill="none" stroke={CO.muted} stroke-width="2" />
      <rect x="36" y="158" width="150" height="44" rx="10" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
      <rect x="52" y="172" width="24" height="16" rx="3" fill="none" stroke={CO.muted} stroke-width="2" />
      <rect x="82" y="172" width="24" height="16" rx="3" fill="none" stroke={CO.muted} stroke-width="2" />
      <rect x="36" y="264" width="150" height="44" rx="10" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
      <rect x="52" y="278" width="24" height="16" rx="3" fill="none" stroke={CO.muted} stroke-width="2" />
      <rect x="82" y="278" width="24" height="16" rx="3" fill="none" stroke={CO.muted} stroke-width="2" />
    </g>
    <path d="M186 74 H 234" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M186 180 H 234" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M186 286 H 234" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M186 74 C 200 74, 200 180, 224 180" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M186 286 C 200 286, 200 180, 224 180" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <rect x="248" y="128" width="220" height="104" rx="14" fill={CO.brand50} stroke={CO.brand} stroke-width="2" />
    <circle cx="308" cy="180" r="26" fill="none" stroke={CO.brand} stroke-width="3" />
    <circle cx="308" cy="180" r="8" fill={CO.brand} />
    <path d="M330 158 L350 138 M326 188 L346 208" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <rect x="368" y="156" width="76" height="12" rx="6" fill={CO.brand200} />
    <rect x="368" y="180" width="56" height="10" rx="5" fill={CO.brand100} />
    <path d="M440 166 L448 174 L462 160" fill="none" stroke={CO.brand600} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
{/snippet}

{#snippet reportingSvg()}
  <svg viewBox="0 0 520 360" class="w-full h-auto" role="presentation" aria-hidden="true">
    <rect x="36" y="44" width="88" height="30" rx="15" fill={CO.brand} />
    <circle cx="58" cy="59" r="5" fill={CO.surface} />
    <rect x="70" y="55" width="44" height="8" rx="4" fill={CO.surface} opacity="0.9" />
    <circle cx="320" cy="180" r="54" fill="none" stroke={CO.brand100} stroke-width="2" />
    <circle cx="320" cy="180" r="46" fill="none" stroke={CO.brand200} stroke-width="1.5" />
    <circle cx="320" cy="180" r="6" fill={CO.brand} />
    <line x1="320" y1="180" x2="320" y2="144" stroke={CO.brand600} stroke-width="3" stroke-linecap="round" />
    <line x1="320" y1="180" x2="348" y2="196" stroke={CO.brand600} stroke-width="3" stroke-linecap="round" />
    <line x1="108" y1="132" x2="108" y2="292" stroke={CO.line} stroke-width="2" />
    <circle cx="108" cy="148" r="5" fill={CO.brand} />
    <rect x="128" y="138" width="120" height="20" rx="6" fill={CO.surface} stroke={CO.line} stroke-width="1.5" />
    <circle cx="108" cy="180" r="4" fill={CO.brand200} />
    <rect x="128" y="170" width="96" height="20" rx="6" fill={CO.brand50} stroke={CO.brand100} stroke-width="1.5" />
    <circle cx="108" cy="212" r="4" fill={CO.brand200} />
    <rect x="128" y="202" width="136" height="20" rx="6" fill={CO.surface} stroke={CO.line} stroke-width="1.5" />
    <circle cx="108" cy="244" r="5" fill={CO.brand} />
    <rect x="128" y="234" width="112" height="20" rx="6" fill={CO.brand50} stroke={CO.brand100} stroke-width="1.5" />
    <rect x="396" y="96" width="88" height="26" rx="13" fill={CO.brand50} stroke={CO.brand} stroke-width="2" />
    <rect x="404" y="105" width="56" height="8" rx="4" fill={CO.brand} />
  </svg>
{/snippet}

{#snippet unificationSvg()}
  <svg viewBox="0 0 520 360" class="w-full h-auto" role="presentation" aria-hidden="true">
    <rect x="56" y="48" width="96" height="64" rx="10" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
    <path d="M72 60 H136 M72 74 H136 M72 88 H136" stroke={CO.muted} stroke-width="2" stroke-linecap="round" />
    <path d="M216 48 H304" stroke={CO.muted} stroke-width="2" stroke-linecap="round" />
    <rect x="204" y="56" width="104" height="56" rx="10" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
    <path d="M220 84 L236 100 L292 72" fill="none" stroke={CO.muted} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="356" y="48" width="44" height="28" rx="14" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
    <rect x="356" y="84" width="44" height="28" rx="14" fill={CO.surface} stroke={CO.muted} stroke-width="2" />
    <path d="M104 112 C 104 152, 104 168, 104 188" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M256 112 C 256 160, 256 174, 256 192" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M382 112 C 382 168, 382 182, 382 198" fill="none" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M104 200 H382" stroke={CO.brand} stroke-width="3" stroke-linecap="round" />
    <path d="M196 196 L392 196" stroke={CO.brand} stroke-width="5" stroke-linecap="round" />
    <rect x="148" y="212" width="228" height="96" rx="14" fill={CO.brand50} stroke={CO.brand} stroke-width="2" />
    <rect x="168" y="236" width="108" height="10" rx="5" fill={CO.brand200} />
    <rect x="168" y="258" width="188" height="8" rx="4" fill={CO.brand100} />
    <rect x="168" y="276" width="156" height="8" rx="4" fill={CO.brand100} />
  </svg>
{/snippet}

{#snippet customSvg()}
  <svg viewBox="0 0 520 360" class="w-full h-auto" role="presentation" aria-hidden="true">
    <rect x="140" y="44" width="240" height="272" rx="14" fill={CO.surface} stroke={CO.brand} stroke-width="2" />
    <rect x="140" y="44" width="240" height="40" rx="14" fill={CO.brand50} />
    <rect x="164" y="64" width="24" height="6" rx="3" fill={CO.brand} />
    <rect x="164" y="84" width="80" height="10" rx="5" fill={CO.brand200} />
    <rect x="164" y="108" width="192" height="10" rx="5" fill={CO.line} />
    <rect x="164" y="128" width="168" height="10" rx="5" fill={CO.line} />
    <rect x="164" y="168" width="88" height="56" rx="10" fill={CO.brand50} stroke={CO.brand200} stroke-width="2" />
    <rect x="180" y="184" width="56" height="8" rx="4" fill={CO.brand} />
    <rect x="180" y="200" width="40" height="8" rx="4" fill={CO.brand200} />
    <rect x="268" y="168" width="88" height="56" rx="10" fill={CO.surface} stroke={CO.line} stroke-width="2" />
    <rect x="284" y="184" width="56" height="8" rx="4" fill={CO.line} />
    <rect x="164" y="248" width="192" height="36" rx="10" fill={CO.brand100} />
    <rect x="180" y="260" width="120" height="8" rx="4" fill={CO.brand600} />
  </svg>
{/snippet}

{#snippet renderVisual(item)}
  {#if item.visual === 'pipeline-flow'}
    {@render pipelinesFlow()}
  {:else if item.visual === 'automation-flow'}
    {@render automationFlow()}
  {:else if item.visual === 'decision-loop'}
    {@render decisionLoop()}
  {:else if item.visual === 'automation'}
    {@render automationSvg()}
  {:else if item.visual === 'unification'}
    {@render unificationSvg()}
  {:else if item.visual === 'reporting'}
    {@render reportingSvg()}
  {:else if item.visual === 'pulse'}
    {@render pulseSvg()}
  {:else if item.visual === 'dashboards'}
    {@render dashboardsSvg()}
  {:else if item.visual === 'custom'}
    {@render customSvg()}
  {/if}
{/snippet}

<!-- Mobile: accordion (no tab strip) -->
<div class="md:hidden flex flex-col gap-sm">
  {#each items as item, i (item.id)}
    <div class="overflow-hidden rounded-xl border bg-white/70 {active === item.id ? 'border-brand/30' : 'border-text/10'}">
      <button
        id={`${idPrefix}-acc-${item.id}`}
        type="button"
        aria-expanded={active === item.id}
        aria-controls={`${idPrefix}-acc-panel-${item.id}`}
        onclick={() => select(i)}
        class="flex w-full items-center gap-sm px-md py-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <span aria-hidden="true" class="text-xs font-semibold tabular-nums text-brand/70">{pad(i)}</span>
        <span class="flex-1 font-semibold text-base leading-snug {active === item.id ? 'text-text' : 'text-muted'}">
          {item.label}
        </span>
        <svg
          class="h-4 w-4 shrink-0 text-brand motion-safe:transition-transform motion-safe:duration-fast {active === item.id ? 'rotate-180' : ''}"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {#if active === item.id}
        <div id={`${idPrefix}-acc-panel-${item.id}`} class="px-md pb-md">
          <p class="text-sm text-muted">{item.description}</p>
          {#if item.note}
            <p class="mt-xs text-xs text-muted">{item.note}</p>
          {/if}
          <div class="mt-md overflow-hidden rounded-lg border border-text/10 bg-white/80 p-md">
            {@render renderVisual(item)}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>

<!-- Tablet + desktop: wrapping tabs + panel -->
<div class="hidden md:grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-md lg:gap-xl items-start">
  <div
    role="tablist"
    aria-label={label}
    onkeydown={handleKeydown}
    class="flex flex-row flex-wrap lg:flex-col gap-xs lg:gap-sm"
  >
    {#each items as item, i (item.id)}
      <button
        id={`${idPrefix}-tab-${item.id}`}
        role="tab"
        type="button"
        aria-selected={active === item.id}
        aria-controls={`${idPrefix}-panel`}
        tabindex={active === item.id ? 0 : -1}
        onclick={() => select(i)}
        class="group flex items-start gap-sm whitespace-nowrap lg:whitespace-normal rounded-lg border px-md py-sm text-left transition-colors duration-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 {active === item.id
          ? 'border-brand bg-white text-text shadow-sm'
          : 'border-text/10 bg-white/60 text-muted hover:border-text/25 hover:text-text'}"
      >
        <span aria-hidden="true" class="text-xs font-semibold tabular-nums text-brand/70 pt-0.5">{pad(i)}</span>
        <span class="min-w-0 flex-1">
          <span class="block font-semibold text-base leading-snug">{item.label}</span>
          <span class="mt-xs block text-sm text-muted hidden lg:block">
            {item.description}
            {#if item.note}
              <span class="mt-1 block text-xs text-muted">{item.note}</span>
            {/if}
          </span>
        </span>
      </button>
    {/each}
  </div>

  <div class="flex flex-col gap-md min-w-0">
    {#if activeItem}
      <div class="lg:hidden">
        <h3 class="text-h3 mb-xs">{activeItem.label}</h3>
        <p class="text-body text-muted">{activeItem.description}</p>
        {#if activeItem.note}
          <p class="text-sm text-muted">{activeItem.note}</p>
        {/if}
      </div>
    {/if}

    <div
      id={`${idPrefix}-panel`}
      role="tabpanel"
      aria-labelledby={activeItem ? `${idPrefix}-tab-${activeItem.id}` : undefined}
      tabindex="0"
      class="relative overflow-hidden rounded-xl border border-text/10 bg-white/70 p-md lg:p-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {#if activeItem}
        {@render renderVisual(activeItem)}
      {/if}
    </div>
  </div>
</div>
