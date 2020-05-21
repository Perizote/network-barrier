import { compare } from './compare'

let list = new Map()

const clear = () => list.clear()

function get(request) {
  const mockUrl = getURLMatchingRequest(request)
  return list.get(mockUrl)
}

function add(request, response) {
  const { url, host, path, method = 'GET' } = request
  const { json, blob, text, status = 200, headers, times = 1 } = response
  const uri = url ? url : `${ host }${ path }`

  list.set(`${ uri }-${ method }`, { json, blob, text, status, headers, times })
}

function has(request) {
  const mockUrl = getURLMatchingRequest(request)
  return list.has(mockUrl)
}

function getURLMatchingRequest(request) {
  const mock = [ ...list.entries() ]
    .find(([ url ]) => requestMatchesURL(request, url))

  if (!mock) return ''
  return mock[0]
}

function requestMatchesURL(request, fullURL) {
  const { url, method = 'GET' } = request
  const { origin, pathname } = new URL(url)

  return compare(`${ origin }${ pathname }-${ method }`, fullURL)
}

const Mocks = { clear, get, add, has }

export { Mocks }