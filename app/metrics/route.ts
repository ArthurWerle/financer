import { NextResponse } from 'next/server'
import client from 'prom-client'

// prom-client needs Node APIs (not the Edge runtime), and metrics must be
// collected fresh on every scrape.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Next dev/hot-reload can evaluate this module more than once per process, which
// would re-register default metrics and throw. Keep a single registry on the
// global object so collectDefaultMetrics runs exactly once.
const globalForMetrics = globalThis as unknown as {
  metricsRegistry?: client.Registry
}

const register =
  globalForMetrics.metricsRegistry ??
  (() => {
    const r = new client.Registry()
    client.collectDefaultMetrics({ register: r })
    return r
  })()

globalForMetrics.metricsRegistry = register

export async function GET() {
  const body = await register.metrics()

  return new NextResponse(body, {
    status: 200,
    headers: { 'Content-Type': register.contentType },
  })
}
