const baseUrl = `http://127.0.0.1:${process.env.PORT || 4001}`

const response = await fetch(`${baseUrl}/api/benchmark`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ protocol: 'BOTH', packetCount: 5, payloadSize: 64, timeoutMs: 1000 }),
})
const result = await response.json()
if (!response.ok || result.status !== 'ok' || !result.results.TCP || !result.results.UDP) {
  throw new Error(`Benchmark test failed: ${JSON.stringify(result)}`)
}

const invalidResponse = await fetch(`${baseUrl}/api/benchmark`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ protocol: 'INVALID', packetCount: 5 }),
})
if (invalidResponse.status !== 400) throw new Error('Invalid parameter test failed')

console.log(JSON.stringify({
  status: 'passed',
  tcpReceived: result.results.TCP.received,
  udpReceived: result.results.UDP.received,
  tcpLatencyMs: result.results.TCP.latency,
  udpLatencyMs: result.results.UDP.latency,
}, null, 2))
