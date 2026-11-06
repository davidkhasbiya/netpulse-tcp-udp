# NetPulse — TCP vs UDP Performance Analysis Platform

NetPulse membandingkan komunikasi TCP dan UDP menggunakan Vue 3 + Vite pada frontend dan Node.js + Express pada backend. Backend menjalankan HTTP health check, TCP server berbasis `node:net`, dan UDP server berbasis `node:dgram` secara bersamaan.

## Port default

- HTTP/Express: `4001`
- TCP: `5003`
- UDP: `5004`

Port dapat diubah melalui `PORT`, `TCP_PORT`, dan `UDP_PORT`.

## Menjalankan backend

```powershell
cd backend
npm install
npm run dev
```

Gunakan `npm start` untuk menjalankan tanpa mode watch. Health check tersedia di `http://localhost:4001/api/health`.

## Testing TCP dan UDP

Pastikan backend sedang berjalan, lalu buka terminal kedua:

```powershell
cd backend
npm run test:protocols
```

Script tersebut menggunakan socket TCP dan UDP sungguhan ke `127.0.0.1`, mengirim pesan JSON `ping`, lalu memeriksa response `pong` dari masing-masing server. TCP menggunakan newline-delimited JSON sebagai framing pesan; UDP menggunakan satu datagram JSON per pesan.

Format response berisi `type`, `testId`, `sequence`, `protocol`, `receivedAt`, dan `payload`. Pesan JSON yang tidak valid menghasilkan response bertipe `error` dan tidak menghentikan server.

## Menjalankan frontend

```powershell
cd frontend
npm run dev
```

## Benchmark engine

Endpoint `POST /api/benchmark` menjalankan benchmark socket nyata pada TCP, UDP, atau keduanya.

Contoh request:

```powershell
$body = @{ protocol = 'BOTH'; packetCount = 100; payloadSize = 1024; timeoutMs = 3000 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:4001/api/benchmark -ContentType 'application/json' -Body $body
```

Parameter yang tersedia:

- `protocol`: `TCP`, `UDP`, atau `BOTH` (default `BOTH`).
- `packetCount`: jumlah paket, default `10`, maksimum `1000`.
- `payloadSize`: ukuran field payload dalam byte, default `1024`, maksimum `65536`.
- `timeoutMs`: timeout response per paket, default `3000`, maksimum `30000`.

TCP memakai satu koneksi persistent dan newline-delimited JSON. UDP memakai satu datagram per paket. Pengiriman dilakukan berurutan: paket berikutnya dikirim setelah response atau timeout paket sebelumnya.

Statistik yang dikembalikan:

- RTT/latency: `min`, `max`, `average`, dan `median` dalam milisecond, diukur dari timestamp client menggunakan `process.hrtime.bigint()`.
- Throughput: `bytesPerSecond = (payloadSize × receivedResponses) / elapsedSeconds` dan `kbps = bytesPerSecond / 1024`. Ini adalah throughput payload aplikasi, bukan raw network throughput karena overhead header tidak dihitung.
- Delivery rate: `receivedResponses / sentPackets × 100%`.
- Application-level packet loss: `(sentPackets - receivedResponses) / sentPackets × 100%`. Nilai ini bukan pengukuran pasti packet loss pada jaringan fisik.

Dengan backend aktif, benchmark otomatis dapat diuji melalui:

```powershell
cd backend
$env:PORT=4001
$env:TCP_PORT=5003
$env:UDP_PORT=5004
npm run test:benchmark
```

Test tersebut menjalankan `BOTH` melalui API dengan socket TCP/UDP nyata dan memverifikasi penolakan parameter invalid. Hasil bergantung pada kondisi mesin dan jaringan saat pengujian; tidak ada hasil yang di-hardcode.
