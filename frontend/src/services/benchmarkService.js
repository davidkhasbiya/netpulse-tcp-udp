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
