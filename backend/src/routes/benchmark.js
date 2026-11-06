import { Router } from 'express'

import { runBenchmark } from '../services/benchmarkService.js'

const benchmarkRouter = Router()

benchmarkRouter.post('/benchmark', async (req, res) => {
  try {
    const result = await runBenchmark(req.body)
    res.json({ status: 'ok', ...result })
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message })
  }
})

export default benchmarkRouter
