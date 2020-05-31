import { compare } from './compare'

let list = new Map()

const clear = () => list.clear()

function get(request) {
  const key = getMockKeyMatchingRequest(request)
  return list.get(key)
}

function add(request, response) {
  list.set(generateKey(request), fillResponseDefaults(response))
}

function generateKey({ url, host, path, method = 'GET' }) {
  try {
    const { origin, pathname } = new URL(url)
    return JSON.stringify({ url: `${ origin }${ pathname }`, method })
  } catch {
    return JSON.stringify({ url: `${ host + path }`, method })
  }
}

const fillResponseDefaults = ({ status = 200, times = 1, ...restOfResponse }) => ({ status, times, ...restOfResponse })

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
  if (key.method !== method) return false

  try {
    const { origin, pathname } = new URL(url)
    return compare(`${ origin }${ pathname }`, key.url)
  } catch {
    return compare(url, key.url)
  }
}

const Mocks = { clear, get, add, has }

export { Mocks }