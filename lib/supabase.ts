const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export class SupabaseApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "SupabaseApiError"
    this.status = status
    this.code = code
  }
}

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required. Configure Supabase environment variables before using GameVault APIs.`)
  }

  return value
}

function baseUrl() {
  return requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL").replace(/\/$/, "")
}

function key(admin = true) {
  return admin
    ? requireEnv(supabaseServiceRoleKey, "SUPABASE_SERVICE_ROLE_KEY")
    : requireEnv(supabaseAnonKey, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
}

async function parseResponse(response: Response) {
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new SupabaseApiError(
      data?.message || data?.msg || data?.error_description || data?.error || response.statusText,
      response.status,
      data?.code || data?.error_code || data?.error
    )
  }

  return data
}

export async function supabaseRest<T>(
  table: string,
  options: {
    method?: string
    query?: URLSearchParams
    body?: unknown
    headers?: Record<string, string>
    admin?: boolean
  } = {}
): Promise<T> {
  const apiKey = key(options.admin ?? true)
  const query = options.query?.toString()
  const response = await fetch(`${baseUrl()}/rest/v1/${table}${query ? `?${query}` : ""}`, {
    method: options.method || "GET",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  return parseResponse(response) as Promise<T>
}

export async function supabaseAuth<T>(
  path: string,
  options: {
    method?: string
    body?: unknown
    accessToken?: string
  } = {}
): Promise<T> {
  const anonKey = key(false)
  const response = await fetch(`${baseUrl()}/auth/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${options.accessToken || anonKey}`,
      "Content-Type": "application/json",
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  return parseResponse(response) as Promise<T>
}

export function hasSupabaseConfig() {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseServiceRoleKey)
}
