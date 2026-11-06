<script setup>
import { RouterLink } from 'vue-router'
import ResultsPanel from '../components/results/ResultsPanel.vue'
import BenchmarkCharts from '../components/results/BenchmarkCharts.vue'
import { benchmarkSession } from '../services/benchmarkSession.js'
</script>

<template><main class="main-content"><div class="page-intro"><div><p class="eyebrow">SESSION RESULTS</p><h1>Results</h1><p class="intro-copy">Review the latest completed benchmark from this browser session.</p></div></div><template v-if="benchmarkSession.result"><ResultsPanel :result="benchmarkSession.result" /><BenchmarkCharts :result="benchmarkSession.result" /></template><section v-else class="empty-state panel"><div class="empty-visual"><span></span><span></span><span></span></div><h2>No results available</h2><p>Complete a benchmark first. Results are kept in memory for the current session only.</p><RouterLink class="primary-button" to="/benchmark">Go to benchmark <b>→</b></RouterLink></section></main></template>
