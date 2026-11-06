<script setup>
import { onMounted } from 'vue'
import BenchmarkForm from '../components/benchmark/BenchmarkForm.vue'
import ResultsPanel from '../components/results/ResultsPanel.vue'
import BenchmarkCharts from '../components/results/BenchmarkCharts.vue'
import { benchmarkSession, refreshBackendStatus, startBenchmark } from '../services/benchmarkSession.js'

onMounted(refreshBackendStatus)
</script>

<template>
  <main class="main-content"><div class="page-intro"><div><p class="eyebrow">NETWORK PERFORMANCE LAB <span class="live-mark">LIVE</span></p><h1>Benchmark workspace</h1><p class="intro-copy">Measure how TCP and UDP behave under the same workload.</p></div></div><div v-if="benchmarkSession.error" class="alert error-alert"><strong>Benchmark could not be completed</strong><span>{{ benchmarkSession.error }}</span></div><div v-if="benchmarkSession.successMessage" class="alert success-alert"><strong>{{ benchmarkSession.successMessage }}</strong><span>Results below reflect the latest socket measurement.</span></div><div class="content-grid"><BenchmarkForm :running="benchmarkSession.running" @submit="startBenchmark" /><aside class="how-panel"><p class="eyebrow">HOW IT WORKS</p><h3>One workload.<br><span>Two protocols.</span></h3><div class="flow"><div><b>01</b><span>Configure payload and packet count</span></div><div><b>02</b><span>Send through native Node sockets</span></div><div><b>03</b><span>Compare measured response data</span></div></div><div class="protocol-legend"><span><i class="legend-dot tcp-dot"></i>TCP</span><span><i class="legend-dot udp-dot"></i>UDP</span></div></aside></div><section v-if="benchmarkSession.running" class="loading-state panel"><span class="loading-bars"><i></i><i></i><i></i></span><h2>Benchmark in progress</h2><p>Sending packets through the selected native socket. Results will appear when the run completes.</p></section><template v-else><ResultsPanel :result="benchmarkSession.result" /><BenchmarkCharts v-if="benchmarkSession.result" :result="benchmarkSession.result" /></template></main>
</template>
