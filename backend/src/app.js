import cors from 'cors'
import express from 'express'

import healthRouter from './routes/health.js'

const app = express()
const port = Number(process.env.PORT) || 4000

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', healthRouter)

app.listen(port, () => {
  console.log(`NetPulse backend listening on port ${port}`)
})
