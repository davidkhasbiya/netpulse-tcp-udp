<script setup>
import { onMounted, ref } from 'vue'
import Sidebar from '../components/layout/Sidebar.vue'
import Topbar from '../components/layout/Topbar.vue'
import BenchmarkForm from '../components/benchmark/BenchmarkForm.vue'
import ResultsPanel from '../components/results/ResultsPanel.vue'
import BenchmarkCharts from '../components/results/BenchmarkCharts.vue'
import { getBackendHealth, runBenchmark } from '../services/benchmarkService.js'

const running = ref(false)
const backendOnline = ref(false)
const result = ref(null)
const error = ref('')
const successMessage = ref('')

async function checkHealth() {
  try { await getBackendHealth(); backendOnline.value = true } catch { backendOnline.value = false }
}
async function startBenchmark(config) {
  running.value = true; error.value = ''; successMessage.value = ''
  try { result.value = await runBenchmark(config); backendOnline.value = true; successMessage.value = 'Benchmark completed successfully.' } catch (err) { error.value = err.message; backendOnline.value = false } finally { running.value = false }
}
onMounted(checkHealth)
</script>

<template>
  <div class="app-shell"><Sidebar active-item="Dashboard" /><div class="page-shell"><Topbar :backend-online="backendOnline" :running="running" /><main class="main-content"><div class="page-intro"><div><p class="eyebrow">NETWORK PERFORMANCE LAB <span class="live-mark">LIVE</span></p><h1>Benchmark workspace</h1><p class="intro-copy">Measure how TCP and UDP behave under the same workload.</p></div><div class="server-chip"><span class="pulse-ring"></span><div><small>SERVER STATUS</small><strong>{{ backendOnline ? 'All systems operational' : 'Waiting for backend' }}</strong></div></div></div><div v-if="error" class="alert error-alert"><strong>Benchmark could not be completed</strong><span>{{ error }}</span></div><div v-if="successMessage" class="alert success-alert"><strong>{{ successMessage }}</strong><span>Results below reflect the latest socket measurement.</span></div><div class="content-grid"><BenchmarkForm :running="running" @submit="startBenchmark" /><aside class="how-panel"><p class="eyebrow">HOW IT WORKS</p><h3>One workload.<br><span>Two protocols.</span></h3><div class="flow"><div><b>01</b><span>Configure payload and packet count</span></div><div><b>02</b><span>Send through native Node sockets</span></div><div><b>03</b><span>Compare measured response data</span></div></div><div class="protocol-legend"><span><i class="legend-dot tcp-dot"></i>TCP</span><span><i class="legend-dot udp-dot"></i>UDP</span></div></aside></div><section v-if="running" class="loading-state panel"><span class="loading-bars"><i></i><i></i><i></i></span><h2>Benchmark in progress</h2><p>Sending packets through the selected native socket. Results will appear when the run completes.</p></section><template v-else><ResultsPanel :result="result" /><BenchmarkCharts v-if="result" :result="result" /></template></main></div></div>
</template>
