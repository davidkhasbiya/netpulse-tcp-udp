import net from 'node:net'
import dgram from 'node:dgram'

const DEFAULTS = { protocol: 'BOTH', packetCount: 10, payloadSize: 1024, timeoutMs: 3000 }
const LIMITS = { packetCount: 1000, payloadSize: 64 * 1024, timeoutMs: 30000 }

export function validateBenchmarkConfig(input = {}) {
  const config = { ...DEFAULTS, ...input }
  if (!['TCP', 'UDP', 'BOTH'].includes(config.protocol)) throw new Error('protocol must be TCP, UDP, or BOTH')
  for (const field of ['packetCount', 'payloadSize', 'timeoutMs']) {
    if (!Number.isInteger(config[field]) || config[field] < 1 || config[field] > LIMITS[field]) {
      throw new Error(`${field} must be an integer between 1 and ${LIMITS[field]}`)
    }
  }
  return config
}

function now() { return process.hrtime.bigint() }
function elapsedMs(start) { return Number(now() - start) / 1e6 }

function statistics(rtts, sent, durationMs, payloadSize) {
  const sorted = [...rtts].sort((a, b) => a - b)
  const received = rtts.length
  const totalPayloadBytes = received * payloadSize
  const bytesPerSecond = durationMs > 0 ? totalPayloadBytes / (durationMs / 1000) : 0
  return {
    sent,
    received,
    timeouts: sent - received,
    deliveryRate: sent ? (received / sent) * 100 : 0,
    packetLossRate: sent ? ((sent - received) / sent) * 100 : 0,
    latency: {
      min: sorted[0] ?? null,
      max: sorted.at(-1) ?? null,
      average: received ? rtts.reduce((sum, value) => sum + value, 0) / received : null,
      median: received ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2) : null,
      samples: rtts,
    },
    throughput: {
      bytesPerSecond,
      kbps: bytesPerSecond / 1024,
      measuredDurationMs: durationMs,
    },
  }
}

function messageFor(testId, sequence, payloadSize) {
  return { type: 'ping', testId, sequence, payload: 'x'.repeat(payloadSize) }
}

function tcpBenchmark({ host, port, testId, packetCount, payloadSize, timeoutMs }) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    let buffer = ''
    let pending
    let sent = 0
    const rtts = []
    const benchmarkStart = now()
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      clearTimeout(pending?.timer)
      socket.destroy()
      resolve(statistics(rtts, sent, elapsedMs(benchmarkStart), payloadSize))
    }
    const failPending = () => {
      pending = undefined
      finish()
    }
    const sendNext = () => {
      if (sent >= packetCount) return finish()
      const sequence = ++sent
      pending = { sequence, started: now(), timer: setTimeout(failPending, timeoutMs) }
      socket.write(`${JSON.stringify(messageFor(testId, sequence, payloadSize))}\n`)
    }

    socket.setEncoding('utf8')
    socket.on('connect', sendNext)
    socket.on('data', (chunk) => {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        if (!line.trim() || !pending) continue
        try {
          const response = JSON.parse(line)
          if (response.type === 'pong' && response.sequence === pending.sequence) {
            clearTimeout(pending.timer)
            rtts.push(Number(now() - pending.started) / 1e6)
            pending = undefined
            sendNext()
          }
        } catch { /* Ignore malformed responses and wait for timeout. */ }
      }
    })
    socket.on('error', failPending)
    socket.on('close', () => { if (!finished) failPending() })
  })
}

function udpBenchmark({ host, port, testId, packetCount, payloadSize, timeoutMs }) {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4')
    const pending = new Map()
    const rtts = []
    let sent = 0
    const benchmarkStart = now()
    const finish = () => {
      for (const item of pending.values()) clearTimeout(item.timer)
      socket.close()
      resolve(statistics(rtts, sent, elapsedMs(benchmarkStart), payloadSize))
    }
    const sendNext = () => {
      if (sent >= packetCount) { if (!pending.size) finish(); return }
      const sequence = ++sent
      const started = now()
      const timer = setTimeout(() => { pending.delete(sequence); sendNext() }, timeoutMs)
      pending.set(sequence, { started, timer })
      socket.send(Buffer.from(JSON.stringify(messageFor(testId, sequence, payloadSize))), port, host)
    }
    socket.on('message', (buffer) => {
      try {
        const response = JSON.parse(buffer.toString())
        const item = pending.get(response.sequence)
        if (response.type !== 'pong' || !item) return
        clearTimeout(item.timer)
        pending.delete(response.sequence)
        rtts.push(Number(now() - item.started) / 1e6)
        if (sent < packetCount) sendNext()
        else if (!pending.size) finish()
      } catch { /* Ignore malformed datagrams. */ }
    })
    socket.on('error', () => finish())
    socket.bind(() => sendNext())
  })
}

export async function runBenchmark(input, options = {}) {
  const config = validateBenchmarkConfig(input)
  const testId = options.testId ?? `benchmark-${Date.now()}`
  const common = {
    host: options.host ?? '127.0.0.1',
    testId,
    packetCount: config.packetCount,
    payloadSize: config.payloadSize,
    timeoutMs: config.timeoutMs,
  }
  const results = {}
  if (config.protocol === 'TCP' || config.protocol === 'BOTH') results.TCP = await tcpBenchmark({ ...common, port: options.tcpPort ?? (Number(process.env.TCP_PORT) || 5003) })
  if (config.protocol === 'UDP' || config.protocol === 'BOTH') results.UDP = await udpBenchmark({ ...common, port: options.udpPort ?? (Number(process.env.UDP_PORT) || 5004) })
  return { testId, config, results }
}
