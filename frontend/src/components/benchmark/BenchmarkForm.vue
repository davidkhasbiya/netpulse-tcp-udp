<script setup>
import { reactive, ref } from 'vue'

const emit = defineEmits(['submit'])
const props = defineProps({ running: Boolean })
const form = reactive({ targetHost: '127.0.0.1', protocol: 'BOTH', packetCount: 100, payloadSize: 1024, timeoutMs: 3000 })
const errors = ref({})
function validTargetHost(value) {
  const host = value.trim()
  const octets = host.split('.')
  const validIpv4 = octets.length === 4 && octets.every((part) => /^\d{1,3}$/.test(part) && Number(part) <= 255)
  const validHostname = /^(localhost|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)$/.test(host)
  return validIpv4 || validHostname
}

function validate() {
  const next = {}
  if (!form.targetHost.trim() || form.targetHost.length > 253 || !validTargetHost(form.targetHost)) next.targetHost = 'Masukkan IP LAN atau hostname yang valid.'
  if (!['TCP', 'UDP', 'BOTH'].includes(form.protocol)) next.protocol = 'Pilih protokol yang valid.'
  if (!Number.isInteger(Number(form.packetCount)) || form.packetCount < 1 || form.packetCount > 10000) next.packetCount = 'Gunakan nilai 1–10.000 paket.'
  if (!Number.isInteger(Number(form.payloadSize)) || form.payloadSize < 1 || form.payloadSize > 60000) next.payloadSize = 'Gunakan ukuran 1–60.000 byte.'
  if (!Number.isInteger(Number(form.timeoutMs)) || form.timeoutMs < 100 || form.timeoutMs > 10000) next.timeoutMs = 'Gunakan timeout 100–10.000 ms.'
  errors.value = next
  return Object.keys(next).length === 0
}
function submit() {
  if (!validate()) return
  emit('submit', { targetHost: form.targetHost.trim(), protocol: form.protocol, packetCount: Number(form.packetCount), payloadSize: Number(form.payloadSize), timeoutMs: Number(form.timeoutMs) })
}
</script>

<template>
  <section class="panel config-panel">
    <div class="panel-heading"><div><p class="eyebrow">TEST CONFIGURATION</p><h2>Set up a benchmark</h2><p class="muted">Configure the workload to compare protocol behavior on your local network.</p></div><span class="config-icon">⌁</span></div>
    <form @submit.prevent="submit" novalidate>
      <label class="field field-wide"><span>Target host</span><input v-model="form.targetHost" type="text" inputmode="url" autocomplete="off" placeholder="127.0.0.1"><small>Use 127.0.0.1 locally or the Host laptop LAN IP, e.g. 192.168.1.10.</small><em v-if="errors.targetHost">{{ errors.targetHost }}</em></label>
      <label class="field field-wide"><span>Protocol</span><select v-model="form.protocol"><option>TCP</option><option>UDP</option><option>BOTH</option></select><small>Run one protocol or compare both with the same workload.</small><em v-if="errors.protocol">{{ errors.protocol }}</em></label>
      <div class="field-grid">
        <label class="field"><span>Packet count</span><div class="input-suffix"><input v-model.number="form.packetCount" type="number" min="1" max="10000"><b>pkts</b></div><small>Number of sequential messages sent.</small><em v-if="errors.packetCount">{{ errors.packetCount }}</em></label>
        <label class="field"><span>Payload size</span><div class="input-suffix"><input v-model.number="form.payloadSize" type="number" min="1" max="60000"><b>bytes</b></div><small>Application payload per packet.</small><em v-if="errors.payloadSize">{{ errors.payloadSize }}</em></label>
        <label class="field"><span>Response timeout</span><div class="input-suffix"><input v-model.number="form.timeoutMs" type="number" min="100" max="10000"><b>ms</b></div><small>Maximum wait for each response.</small><em v-if="errors.timeoutMs">{{ errors.timeoutMs }}</em></label>
      </div>
      <div class="form-footer"><span class="native-note"><i></i> Native socket measurement</span><button class="primary-button" type="submit" :disabled="props.running"><span v-if="props.running" class="spinner"></span>{{ props.running ? 'Running benchmark' : 'Start benchmark' }} <b v-if="!props.running">→</b></button></div>
    </form>
  </section>
</template>
