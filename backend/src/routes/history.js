import { Router } from 'express'
import { exportBenchmarksCsv, getBenchmarkById, listBenchmarks } from '../services/database.js'

const historyRouter = Router()

historyRouter.get('/benchmark/history', (req, res) => {
  res.json({ status: 'ok', ...listBenchmarks(req.query) })
})

historyRouter.get('/benchmark/history/export.csv', (req, res) => {
  const { csv, count } = exportBenchmarksCsv()
  if (!count) return res.status(404).json({ status: 'error', message: 'No benchmark history available to export' })
  const date = new Date().toISOString().slice(0, 10)
  res.set({ 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="netpulse-benchmark-history-${date}.csv"` })
  return res.send(csv)
})

historyRouter.get('/benchmark/history/:id', (req, res) => {
  const item = getBenchmarkById(Number(req.params.id))
  if (!item) return res.status(404).json({ status: 'error', message: 'Benchmark result not found' })
  return res.json({ status: 'ok', item })
})

export default historyRouter
