<script setup>
const items = [
  { label: 'Dashboard', to: '/' },
  { label: 'Benchmark', to: '/benchmark' },
  { label: 'Results', to: '/results' },
  { label: 'About NetPulse', to: '/about' },
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark"><span></span><span></span><span></span></div>
      <div><strong>netpulse</strong><small>NETWORK LAB</small></div>
    </div>
    <div class="nav-label">WORKSPACE</div>
    <nav class="side-nav" aria-label="Main navigation">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" active-class="active" exact-active-class="active">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path v-if="item.label === 'Dashboard'" d="M4 13h6V4H4v9Zm10 7h6v-9h-6v9ZM4 20h6v-3H4v3Zm10-12h6V4h-6v4Z"/><path v-else-if="item.label === 'Benchmark'" d="M5 19V9m7 10V5m7 14v-7M3 19h4m3 0h4m3 0h4"/><path v-else-if="item.label === 'Results'" d="M5 4h14v16H5zM8 16l2-3 2 2 3-5 2 3"/><path v-else d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-11V7m0 8v-1"/></svg>
        <span>{{ item.label }}</span>
      </RouterLink>
    </nav>
    <div class="sidebar-footer"><div class="status-dot"></div><div><strong>Local workspace</strong><small>Ready for testing</small></div></div>
  </aside>
</template>
