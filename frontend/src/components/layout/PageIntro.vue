<script setup>
defineProps({ title: String, eyebrow: String, description: String, backendOnline: Boolean })
</script>

<template>
  <div class="page-intro"><div><p class="eyebrow">{{ eyebrow }}</p><h1>{{ title }}</h1><p class="intro-copy">{{ description }}</p></div><div class="server-chip"><span class="pulse-ring"></span><div><small>SERVER STATUS</small><strong>{{ backendOnline ? 'All systems operational' : 'Waiting for backend' }}</strong></div></div></div>
</template>
