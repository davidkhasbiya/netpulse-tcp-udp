<script setup>
import { onMounted } from 'vue'
import Sidebar from './components/layout/Sidebar.vue'
import Topbar from './components/layout/Topbar.vue'
import { benchmarkSession, refreshBackendStatus } from './services/benchmarkSession.js'

onMounted(refreshBackendStatus)
</script>

<template><div class="app-shell"><Sidebar /><div class="page-shell"><Topbar :backend-online="benchmarkSession.backendOnline" :running="benchmarkSession.running" /><RouterView /></div></div></template>
