<script setup>
defineProps({ backendOnline: Boolean, running: Boolean })
</script>

<template>
  <header class="topbar">
    <div class="breadcrumb"><span>Workspace</span><b>/</b><strong>Dashboard</strong></div>
    <div class="topbar-right">
      <span class="backend-status" :class="{ offline: !backendOnline }"><i></i>{{ backendOnline ? 'Backend connected' : 'Backend offline' }}</span>
      <span class="divider"></span><span class="environment">LOCAL</span>
    </div>
  </header>
</template>
