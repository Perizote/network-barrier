const DEFAULT = Promise.resolve({ json: () => Promise.resolve() })

const create = response => Promise.resolve({
  json: () => Promise.resolve(response.json),
  blob: () => Promise.resolve(response.blob),
  text: () => Promise.resolve(response.text),
  status: response.status,
  headers: new Headers(response.headers),
  ok: response.status >= 200 && response.status <= 299,
})

const Response = { DEFAULT, create }

export { Response }