import net from 'node:net'

import { createErrorMessage, createPongMessage } from '../services/messageService.js'

const MAX_BUFFER_SIZE = 1024 * 1024

function sendJson(socket, message) {
  socket.write(`${JSON.stringify(message)}\n`)
}

function handleMessage(socket, rawMessage) {
  try {
    const message = JSON.parse(rawMessage)
    sendJson(socket, createPongMessage(message, 'TCP'))
  } catch (error) {
    console.warn(`[TCP] Invalid message: ${error.message}`)
    sendJson(socket, createErrorMessage(error))
  }
}

export function createTcpServer({ port = 5001, host = '0.0.0.0' } = {}) {
  const server = net.createServer((socket) => {
    let buffer = ''
    console.log(`[TCP] Client connected: ${socket.remoteAddress}:${socket.remotePort}`)

    socket.setEncoding('utf8')
    socket.on('data', (chunk) => {
      buffer += chunk
      if (buffer.length > MAX_BUFFER_SIZE) {
        sendJson(socket, createErrorMessage(new Error('Message buffer is too large')))
        socket.destroy()
        return
      }

      const messages = buffer.split('\n')
      buffer = messages.pop()
      for (const message of messages) {
        if (message.trim()) handleMessage(socket, message.trim())
      }
    })
    socket.on('end', () => {
      if (buffer.trim()) handleMessage(socket, buffer.trim())
      console.log('[TCP] Client disconnected')
    })
    socket.on('error', (error) => console.warn(`[TCP] Client error: ${error.message}`))
  })

  server.on('error', (error) => console.error(`[TCP] Server error: ${error.message}`))
  server.on('listening', () => console.log(`[TCP] Listening on ${host}:${port}`))
  server.listen(port, host)
  return server
}

export function closeTcpServer(server) {
  return new Promise((resolve) => {
    if (!server || !server.listening) return resolve()
    server.close(() => {
      console.log('[TCP] Server stopped')
      resolve()
    })
  })
}
