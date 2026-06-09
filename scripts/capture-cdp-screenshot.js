const fs = require("fs")

const targetUrl = process.argv[2] || "http://localhost:3001"
const outputPath =
  process.argv[3] ||
  "C:/Users/ghani/Downloads/gamevault_final/gamevault_final/gamevault_fullpage_screenshot.jpg"
const cdpUrl = process.argv[4] || "http://localhost:9222"
const selector = process.argv[5]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function requestJson(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`${url} returned ${response.status}`)
  return response.json()
}

async function main() {
  const version = await requestJson(`${cdpUrl}/json/version`)
  const ws = new WebSocket(version.webSocketDebuggerUrl)

  let id = 0
  const pending = new Map()

  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data)
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id)
      pending.delete(message.id)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    }
  })

  await new Promise((resolve) => ws.addEventListener("open", resolve, { once: true }))

  function send(method, params = {}) {
    const messageId = ++id
    ws.send(JSON.stringify({ id: messageId, method, params }))
    return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }))
  }

  const { targetId } = await send("Target.createTarget", { url: "about:blank" })
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true })

  function pageSend(method, params = {}) {
    const messageId = ++id
    ws.send(JSON.stringify({ id: messageId, sessionId, method, params }))
    return new Promise((resolve, reject) => pending.set(messageId, { resolve, reject }))
  }

  await pageSend("Page.enable")
  await pageSend("Runtime.enable")
  await pageSend("Page.navigate", { url: targetUrl })
  await delay(7000)

  const metrics = await pageSend("Runtime.evaluate", {
    expression:
      "({ width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth, 1280), height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight, 720) })",
    returnByValue: true,
  })
  const width = Math.min(1600, metrics.result.value.width)
  const height = Math.min(8000, metrics.result.value.height)

  await pageSend("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await delay(1000)

  let clip
  if (selector) {
    const elementBox = await pageSend("Runtime.evaluate", {
      expression: `(() => {
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: Math.max(0, rect.x + window.scrollX),
          y: Math.max(0, rect.y + window.scrollY),
          width: Math.max(1, rect.width),
          height: Math.max(1, rect.height),
          scale: 1
        };
      })()`,
      returnByValue: true,
    })
    clip = elementBox.result.value
  }

  const screenshot = await pageSend("Page.captureScreenshot", {
    format: "jpeg",
    quality: 92,
    captureBeyondViewport: true,
    fromSurface: true,
    ...(clip ? { clip } : {}),
  })

  fs.writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"))
  await send("Target.closeTarget", { targetId })
  ws.close()

  console.log(outputPath)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
