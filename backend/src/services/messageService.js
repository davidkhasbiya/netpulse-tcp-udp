export function createPongMessage(message, protocol, receivedAt = new Date().toISOString()) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    throw new Error('Message must be a JSON object')
  }

  return {
    type: 'pong',
    testId: message.testId,
    sequence: message.sequence,
    protocol,
    receivedAt,
    payload: message.payload,
  }
}

export function createErrorMessage(error) {
  return {
    type: 'error',
    message: error instanceof Error ? error.message : 'Invalid message',
  }
}
