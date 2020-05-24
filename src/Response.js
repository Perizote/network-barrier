import { getConfig } from './config'

const createDefault = () => Promise.resolve({
  json: () => Promise.resolve(),
  text: () => Promise.resolve(),
  blob: () => Promise.resolve(),
  status: 200,
  headers: new Headers(getConfig().headers),
  ok: true,
})

const create = response => Promise.resolve({
  json: () => Promise.resolve(response.json),
  blob: () => Promise.resolve(response.blob),
  text: () => Promise.resolve(response.text),
  status: response.status,
  headers: new Headers({
    ...getConfig().headers,
    ...response.headers,
  }),
  ok: response.status >= 200 && response.status <= 299,
})

const Response = { createDefault, create }

export { Response }