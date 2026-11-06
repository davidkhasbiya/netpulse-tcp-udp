import net from 'node:net'
import dgram from 'node:dgram'

const message = JSON.stringify({
  type: 'ping',
  testId: 'test-001',
  sequence: 1,
  payload: 'NetPulse test message',
})

function testTcp() {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ port: Number(process.env.TCP_PORT) || 5001, host: '127.0.0.1' })
    let response = ''
    client.setEncoding('utf8')
    client.on('connect', () => client.write(`${message}\n`))
    client.on('data', (chunk) => {
      response += chunk
      if (response.includes('\n')) {
        console.log('TCP response:', JSON.parse(response.split('\n')[0]))
        client.end()
        resolve()
      }
    })
    client.on('error', reject)
  })
}

function testUdp() {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4')
    client.once('message', (response) => {
      console.log('UDP response:', JSON.parse(response.toString('utf8')))
      client.close()
      resolve()
    })
    client.once('error', reject)
    client.send(Buffer.from(message), Number(process.env.UDP_PORT) || 5002, '127.0.0.1')
  })
}

try {
  await testTcp()
  await testUdp()
  console.log('TCP and UDP tests passed.')
} catch (error) {
  console.error('Protocol test failed:', error.message)
  process.exitCode = 1
}
