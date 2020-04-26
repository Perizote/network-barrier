const DEFAULT = Promise.resolve({ json: () => Promise.resolve() })

const create = response => Promise.resolve({
  json: () => Promise.resolve(response.json),
  blob: () => Promise.resolve(response.blob),
  status: response.status,
  headers: new Headers(response.headers),
  ok: response.status >= 200 && response.status <= 299,
})

const Response = { DEFAULT, create }

export { Response }