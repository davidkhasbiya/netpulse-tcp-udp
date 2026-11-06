<script setup>
import { computed } from 'vue'

const props = defineProps({ result: { type: Object, required: true } })
const series = computed(() => Object.entries(props.result.results).filter(([, value]) => value))
const hasSamples = computed(() => series.value.some(([, value]) => Array.isArray(value.latency?.samples) && value.latency.samples.length))
const maxPackets = computed(() => Math.max(1, ...series.value.map(([, value]) => value.latency?.samples?.length || 0)))
const maxRtt = computed(() => Math.max(1, ...series.value.flatMap(([, value]) => value.latency?.samples || [])))
const chartW = 720
const chartH = 230
const colors = { TCP: '#42cbd8', UDP: '#e7a15d' }

function points(values) {
  return (values || []).map((value, index) => `${(index / Math.max(1, maxPackets.value - 1)) * chartW},${chartH - (value / maxRtt.value) * (chartH - 18)}`).join(' ')
}
function throughput(value) { return value >= 1024 * 1024 ? `${(value / 1048576).toFixed(2)} MB/s` : `${(value / 1024).toFixed(2)} KB/s` }
function loss(value) { return `${Number(value || 0).toFixed(2)}%` }
function barWidth() { return series.value.length === 1 ? 80 : 52 }
</script>

<template>
  <section class="charts-section">
    <div class="charts-heading"><div><p class="eyebrow">VISUAL ANALYSIS</p><h2>Performance signals</h2></div><span class="chart-note">Actual client-side measurements</span></div>
    <div class="chart-grid">
      <article class="chart-card rtt-chart-card"><div class="chart-card-heading"><div><h3>RTT per packet</h3><p>Round-trip latency across the measured sequence.</p></div><div class="legend"><span v-for="[protocol] in series" :key="protocol"><i :style="{ background: colors[protocol] }"></i>{{ protocol }}</span></div></div>
        <div v-if="hasSamples" class="line-chart-wrap"><div class="axis-y"><span>{{ maxRtt.toFixed(1) }}</span><span>{{ (maxRtt / 2).toFixed(1) }}</span><span>0</span></div><svg class="line-chart" viewBox="0 0 720 230" preserveAspectRatio="none" role="img" aria-label="RTT per packet line chart"><line x1="0" y1="0" x2="720" y2="0" class="grid-line"/><line x1="0" y1="115" x2="720" y2="115" class="grid-line"/><line x1="0" y1="230" x2="720" y2="230" class="grid-line"/><polyline v-for="[protocol, data] in series" :key="protocol" :points="points(data.latency.samples)" fill="none" :stroke="colors[protocol] || '#42cbd8'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"><title>{{ protocol }} RTT samples</title></polyline><g v-for="[protocol, data] in series" :key="`${protocol}-points`"><circle v-for="(value, index) in data.latency.samples" :key="index" :cx="(index / Math.max(1, maxPackets - 1)) * chartW" :cy="chartH - (value / maxRtt) * (chartH - 18)" r="3" :fill="colors[protocol] || '#42cbd8'"><title>{{ protocol }} · packet {{ index + 1 }} · {{ Number(value).toFixed(2) }} ms</title></circle></g></svg><div class="axis-x"><span>1</span><span>{{ Math.ceil(maxPackets / 2) }}</span><span>{{ maxPackets }}</span></div><span class="axis-label y-label">RTT (ms)</span><span class="axis-label x-label">Packet sequence</span></div><div v-else class="chart-fallback">Individual RTT samples are not available in this response.</div>
      </article>
      <article class="chart-card"><div class="chart-card-heading"><div><h3>Throughput</h3><p>Application payload received per second.</p></div><span class="unit-label">Bytes / second</span></div><div class="bar-chart"><div v-for="[protocol, data] in series" :key="protocol" class="bar-item"><div class="bar-value">{{ throughput(data.throughput?.bytesPerSecond || 0) }}</div><div class="bar-track"><div class="bar-fill" :style="{ height: `${Math.max(4, ((data.throughput?.bytesPerSecond || 0) / Math.max(1, ...series.map(([, item]) => item.throughput?.bytesPerSecond || 0))) * 100)}%`, background: colors[protocol] }"></div></div><strong>{{ protocol }}</strong></div></div></article>
      <article class="chart-card loss-chart-card"><div class="chart-card-heading"><div><h3>Packet loss</h3><p>Application-level response loss.</p></div><span class="unit-label">Percent (%)</span></div><div class="loss-bars"><div v-for="[protocol, data] in series" :key="protocol" class="loss-item"><div class="loss-track"><div class="loss-fill" :style="{ height: `${Math.min(100, Number(data.packetLossRate || 0))}%`, background: colors[protocol] }"></div><span>{{ loss(data.packetLossRate) }}</span></div><strong>{{ protocol }}</strong></div></div><small class="chart-footnote">0% loss is a valid measured result, not missing data.</small></article>
    </div>
  </section>
</template>
