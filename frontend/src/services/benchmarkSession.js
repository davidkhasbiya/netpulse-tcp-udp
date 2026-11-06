import { reactive } from 'vue'
import { getBackendHealth, runBenchmark } from './benchmarkService.js'

export const benchmarkSession = reactive({ backendOnline: false, running: false, result: null, error: '', successMessage: '' })

export async function refreshBackendStatus() {
  try { await getBackendHealth(); benchmarkSession.backendOnline = true } catch { benchmarkSession.backendOnline = false }
}

export async function startBenchmark(config) {
  benchmarkSession.running = true; benchmarkSession.error = ''; benchmarkSession.successMessage = ''
  try { benchmarkSession.result = await runBenchmark(config); benchmarkSession.backendOnline = true; benchmarkSession.successMessage = 'Benchmark completed successfully.' } catch (error) { benchmarkSession.error = error.message; benchmarkSession.backendOnline = false } finally { benchmarkSession.running = false }
}
