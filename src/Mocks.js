let list = new Map()

const clear = () => list.clear()

function get(request) {
  const { url, method = 'GET' } = request
  const { origin, pathname } = new URL(url)

  return list.get(`${origin}${pathname}-${method}`)
}

function add(request, response) {
  const { url, host, path, method = 'GET' } = request
  const { json, blob, text, status = 200, headers, times = 1 } = response
  const uri = url ? url : `${host}${path}`

  list.set(`${uri}-${method}`, { json, blob, text, status, headers, times })
}

function has(request) {
  const { url, method = 'GET' } = request
  const { origin, pathname } = new URL(url)

  return list.has(`${origin}${pathname}-${method}`)
}

const Mocks = { clear, get, add, has }

export { Mocks }