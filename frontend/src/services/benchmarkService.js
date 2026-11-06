const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4001'

export async function getBackendHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`)
  if (!response.ok) throw new Error(`Backend health check failed (${response.status})`)
  return response.json()
}

export async function runBenchmark(config) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/api/benchmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
  } catch {
    throw new Error('Backend tidak dapat dihubungi. Pastikan server berjalan di port 4001.')
  }

  const data = await response.json().catch(() => null)
  if (!response.ok || !data || data.status !== 'ok') {
    throw new Error(data?.message || `Benchmark gagal (${response.status})`)
  }
  return data
}

export async function getBenchmarkHistory() {
  const response = await fetch(`${API_BASE_URL}/api/benchmark/history`)
  const data = await response.json().catch(() => null)
  if (!response.ok || !data || data.status !== 'ok') throw new Error(data?.message || 'History benchmark gagal dimuat.')
  return data
}

export async function getBenchmarkDetail(id) {
  const response = await fetch(`${API_BASE_URL}/api/benchmark/history/${id}`)
  const data = await response.json().catch(() => null)
  if (!response.ok || !data || data.status !== 'ok') throw new Error(data?.message || 'Detail benchmark gagal dimuat.')
  return data.item
}

export function historyItemToResult(item) {
  return { testId: item.test_id, config: { protocol: item.protocol, packetCount: item.packet_count, payloadSize: item.payload_size, timeoutMs: item.timeout_ms }, results: { ...(item.tcp_result ? { TCP: item.tcp_result } : {}), ...(item.udp_result ? { UDP: item.udp_result } : {}) } }
}

export async function exportHistoryCsv() {
  const response = await fetch(`${API_BASE_URL}/api/benchmark/history/export.csv`)
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.message || 'CSV export gagal.')
  }
  const blob = await response.blob()
  const disposition = response.headers.get('Content-Disposition') || ''
  const filename = disposition.match(/filename="?([^";]+)"?/)?.[1] || `netpulse-benchmark-history-${new Date().toISOString().slice(0, 10)}.csv`
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
  return filename
}
