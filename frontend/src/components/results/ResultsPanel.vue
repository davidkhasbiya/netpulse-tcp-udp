<script setup>
defineProps({ result: { type: Object, default: null } })
function formatMs(value) { return value == null ? '—' : `${Number(value).toFixed(2)} ms` }
function formatRate(value) { return value == null ? '—' : `${Number(value).toFixed(2)}%` }
function formatThroughput(value) { if (value == null) return '—'; return value >= 1024 * 1024 ? `${(value / (1024 * 1024)).toFixed(2)} MB/s` : `${(value / 1024).toFixed(2)} KB/s` }
</script>

<template>
  <section v-if="result" class="results-section">
    <div class="results-header"><div><p class="eyebrow">LATEST RUN · {{ result.testId }}</p><h2>Benchmark results</h2></div><span class="success-tag"><i></i> Completed</span></div>
    <div class="metric-grid">
      <article v-for="card in [{ label: 'Average RTT', key: 'average', suffix: 'ms' }, { label: 'Throughput', key: 'throughput', suffix: '' }, { label: 'Packet loss', key: 'packetLossRate', suffix: '%' }, { label: 'Delivery rate', key: 'deliveryRate', suffix: '%' }]" :key="card.key" class="metric-card">
        <span>{{ card.label }}</span><strong v-if="card.key === 'throughput'">{{ formatThroughput(result.results.TCP?.throughput?.bytesPerSecond ?? result.results.UDP?.throughput?.bytesPerSecond) }}</strong><strong v-else>{{ card.key === 'average' ? formatMs(result.results.TCP?.latency?.average ?? result.results.UDP?.latency?.average) : formatRate(result.results.TCP?.[card.key] ?? result.results.UDP?.[card.key]) }}</strong><small>{{ result.config.protocol === 'BOTH' ? 'TCP baseline · UDP comparison' : result.config.protocol + ' measurement' }}</small>
      </article>
    </div>
    <div class="comparison-panel panel"><div class="table-title"><div><p class="eyebrow">PROTOCOL COMPARISON</p><h3>Detailed measurements</h3></div><span>{{ result.config.packetCount }} packets · {{ result.config.payloadSize }} bytes</span></div><div class="table-wrap"><table><thead><tr><th>Metric</th><th v-if="result.results.TCP"><span class="protocol-pill tcp">TCP</span></th><th v-if="result.results.UDP"><span class="protocol-pill udp">UDP</span></th></tr></thead><tbody><tr v-for="row in [{l:'Sent',k:'sent'}, {l:'Received',k:'received'}, {l:'Timeouts',k:'timeouts'}, {l:'Average RTT',k:'latency.average',fmt:formatMs}, {l:'Median RTT',k:'latency.median',fmt:formatMs}, {l:'Min RTT',k:'latency.min',fmt:formatMs}, {l:'Max RTT',k:'latency.max',fmt:formatMs}, {l:'Throughput',k:'throughput.bytesPerSecond',fmt:formatThroughput}, {l:'Packet loss rate',k:'packetLossRate',fmt:formatRate}, {l:'Delivery rate',k:'deliveryRate',fmt:formatRate}]" :key="row.k"><td>{{ row.l }}</td><td v-if="result.results.TCP">{{ row.fmt ? row.fmt(row.k.split('.').reduce((a,k) => a?.[k], result.results.TCP)) : result.results.TCP[row.k] }}</td><td v-if="result.results.UDP">{{ row.fmt ? row.fmt(row.k.split('.').reduce((a,k) => a?.[k], result.results.UDP)) : result.results.UDP[row.k] }}</td></tr></tbody></table></div></div>
  </section>
  <section v-else class="empty-state panel"><div class="empty-visual"><span></span><span></span><span></span></div><h2>No benchmark results yet</h2><p>Configure a workload above and start your first test to see live TCP and UDP measurements here.</p></section>
</template>
