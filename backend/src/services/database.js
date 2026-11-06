import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(currentDir, '../../data')
fs.mkdirSync(dataDir, { recursive: true })
export const database = new Database(path.join(dataDir, 'netpulse.sqlite'))
database.pragma('journal_mode = WAL')
database.exec(`CREATE TABLE IF NOT EXISTS benchmark_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT, test_id TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL,
  protocol TEXT NOT NULL, packet_count INTEGER NOT NULL, payload_size INTEGER NOT NULL,
  timeout_ms INTEGER NOT NULL, duration_ms REAL, tcp_result TEXT, udp_result TEXT)`)

const insertResult = database.prepare(`INSERT OR IGNORE INTO benchmark_results
  (test_id, created_at, protocol, packet_count, payload_size, timeout_ms, duration_ms, tcp_result, udp_result)
  VALUES (@testId, @createdAt, @protocol, @packetCount, @payloadSize, @timeoutMs, @durationMs, @tcpResult, @udpResult)`)

export function saveBenchmarkResult(result) {
  const durationMs = Math.max(...Object.values(result.results).map((item) => item.throughput?.measuredDurationMs || 0))
  const info = insertResult.run({ testId: result.testId, createdAt: new Date().toISOString(), protocol: result.config.protocol, packetCount: result.config.packetCount, payloadSize: result.config.payloadSize, timeoutMs: result.config.timeoutMs, durationMs, tcpResult: result.results.TCP ? JSON.stringify(result.results.TCP) : null, udpResult: result.results.UDP ? JSON.stringify(result.results.UDP) : null })
  return getBenchmarkById(info.lastInsertRowid) || getBenchmarkByTestId(result.testId)
}

function deserialize(row) {
  if (!row) return null
  return { ...row, tcp_result: row.tcp_result ? JSON.parse(row.tcp_result) : null, udp_result: row.udp_result ? JSON.parse(row.udp_result) : null }
}
export function listBenchmarks({ limit = 50, offset = 0 } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100)
  const safeOffset = Math.max(Number(offset) || 0, 0)
  const rows = database.prepare('SELECT * FROM benchmark_results ORDER BY datetime(created_at) DESC, id DESC LIMIT ? OFFSET ?').all(safeLimit, safeOffset)
  const total = database.prepare('SELECT COUNT(*) AS count FROM benchmark_results').get().count
  return { items: rows.map(deserialize), total, limit: safeLimit, offset: safeOffset }
}
export function getBenchmarkById(id) { return deserialize(database.prepare('SELECT * FROM benchmark_results WHERE id = ?').get(id)) }
export function getBenchmarkByTestId(testId) { return deserialize(database.prepare('SELECT * FROM benchmark_results WHERE test_id = ?').get(testId)) }
function csvCell(value) {
  let text = value == null ? '' : String(value)
  if (/^[=+\-@]/.test(text.trimStart())) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}
function metric(result, path) { return path.split('.').reduce((value, key) => value?.[key], result) ?? '' }
export function exportBenchmarksCsv() {
  const rows = database.prepare('SELECT * FROM benchmark_results ORDER BY datetime(created_at) DESC, id DESC').all()
  const headers = ['Test ID', 'Created At', 'Protocol', 'Packet Count', 'Payload Size (bytes)', 'Timeout (ms)', 'Duration (ms)', 'TCP Average RTT (ms)', 'TCP Throughput', 'TCP Packet Loss (%)', 'TCP Delivery Rate (%)', 'UDP Average RTT (ms)', 'UDP Throughput', 'UDP Packet Loss (%)', 'UDP Delivery Rate (%)']
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) {
    const tcp = row.tcp_result ? JSON.parse(row.tcp_result) : null
    const udp = row.udp_result ? JSON.parse(row.udp_result) : null
    lines.push([row.test_id, row.created_at, row.protocol, row.packet_count, row.payload_size, row.timeout_ms, row.duration_ms, metric(tcp, 'latency.average'), metric(tcp, 'throughput.bytesPerSecond'), metric(tcp, 'packetLossRate'), metric(tcp, 'deliveryRate'), metric(udp, 'latency.average'), metric(udp, 'throughput.bytesPerSecond'), metric(udp, 'packetLossRate'), metric(udp, 'deliveryRate')].map(csvCell).join(','))
  }
  return { csv: `\uFEFF${lines.join('\r\n')}\r\n`, count: rows.length }
}
export function closeDatabase() { database.close() }
