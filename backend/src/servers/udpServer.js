import dgram from 'node:dgram'

import { createErrorMessage, createPongMessage } from '../services/messageService.js'

export function createUdpServer({ port = 5002, host = '0.0.0.0' } = {}) {
  const server = dgram.createSocket('udp4')

  server.on('message', (buffer, remote) => {
    try {
      const message = JSON.parse(buffer.toString('utf8'))
      const response = Buffer.from(JSON.stringify(createPongMessage(message, 'UDP')))
      server.send(response, remote.port, remote.address, (error) => {
        if (error) console.warn(`[UDP] Response error: ${error.message}`)
      })
    } catch (error) {
      console.warn(`[UDP] Invalid message: ${error.message}`)
      const response = Buffer.from(JSON.stringify(createErrorMessage(error)))
      server.send(response, remote.port, remote.address)
    }
  })
  server.on('error', (error) => console.error(`[UDP] Server error: ${error.message}`))
  server.on('listening', () => console.log(`[UDP] Listening on ${host}:${port}`))
  server.bind(port, host)
  return server
}

export function closeUdpServer(server) {
  return new Promise((resolve) => {
    if (!server) return resolve()
    server.close(() => {
      console.log('[UDP] Server stopped')
      resolve()
    })
  })
}
