import { Router } from 'express'

import { runBenchmark } from '../services/benchmarkService.js'
import { saveBenchmarkResult } from '../services/database.js'

const benchmarkRouter = Router()

benchmarkRouter.post('/benchmark', async (req, res) => {
  try {
    const result = await runBenchmark(req.body)
    const saved = saveBenchmarkResult(result)
    res.json({ status: 'ok', ...result, historyId: saved?.id ?? null })
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message })
  }
})

export default benchmarkRouter
