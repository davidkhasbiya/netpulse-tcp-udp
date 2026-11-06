import cors from 'cors'
import express from 'express'
import http from 'node:http'

import healthRouter from './routes/health.js'
import benchmarkRouter from './routes/benchmark.js'
import historyRouter from './routes/history.js'
import { closeDatabase } from './services/database.js'
import { closeTcpServer, createTcpServer } from './servers/tcpServer.js'
import { closeUdpServer, createUdpServer } from './servers/udpServer.js'

const app = express()
const port = Number(process.env.PORT) || 4001
const tcpPort = Number(process.env.TCP_PORT) || 5003
const udpPort = Number(process.env.UDP_PORT) || 5004

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', healthRouter)
app.use('/api', benchmarkRouter)
app.use('/api', historyRouter)

const httpServer = http.createServer(app)
const tcpServer = createTcpServer({ port: tcpPort })
const udpServer = createUdpServer({ port: udpPort })

httpServer.listen(port, () => {
  console.log(`[HTTP] NetPulse backend listening on port ${port}`)
})

let shuttingDown = false
async function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`Received ${signal}; shutting down servers...`)
  await Promise.all([
    closeTcpServer(tcpServer),
    closeUdpServer(udpServer),
    new Promise((resolve) => httpServer.close(resolve)),
  ])
  closeDatabase()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

export { app, httpServer, tcpServer, udpServer }
