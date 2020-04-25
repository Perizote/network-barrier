let list = new Map()

const clear = () => list.clear()

function get(request) {
  const { url, method = 'GET' } = request

  return list.get(`${url}-${method}`)
}

function add(request, response) {
  const { url, host, path, method = 'GET' } = request
  const { json, status = 200, headers, times = 1 } = response
  const uri = url ? url : `${host}${path}`

  list.set(`${uri}-${method}`, { json, status, headers, times })
}

function has(request) {
  const { url, method = 'GET' } = request

  return list.has(`${url}-${method}`)
}

const Mocks = { clear, get, add, has }

export { Mocks }