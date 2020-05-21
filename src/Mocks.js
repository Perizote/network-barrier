import { compare } from './compare'

let list = new Map()

const clear = () => list.clear()

function get(request) {
  const key = getMockKeyMatchingRequest(request)
  return list.get(key)
}

function add(request, response) {
  const { url, host, path, method = 'GET' } = request
  const { json, blob, text, status = 200, headers, times = 1 } = response
  const uri = url ? url : `${ host }${ path }`

  list.set(JSON.stringify({ url: uri, method }), { json, blob, text, status, headers, times })
}

function has(request) {
  const key = getMockKeyMatchingRequest(request)
  return list.has(key)
}

function getMockKeyMatchingRequest(request) {
  const mock = [ ...list.entries() ]
    .find(([ key ]) => keyIdentifiesRequest(request, JSON.parse(key)))

  if (!mock) return ''
  return mock[0]
}

function keyIdentifiesRequest(request, key) {
  const { url, method = 'GET' } = request
  const { origin, pathname } = new URL(url)

  if (key.method !== method) return false

  return compare(`${ origin }${ pathname }`, key.url)
}

const Mocks = { clear, get, add, has }

export { Mocks }