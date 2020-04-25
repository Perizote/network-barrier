import { Response } from './Response'

class Mocks {
  constructor() {
    this.list = new Map()
  }

  clear() {
    this.list.clear()
  }

  get(request) {
    const { url, method = 'GET' } = request

    return this.list.get(`${url}-${method}`)
  }

  add(request, response) {
    const { url, host, path, method = 'GET' } = request
    const { json, status = 200, headers, times = 1 } = response
    const uri = url ? url : `${host}${path}`

    this.list.set(`${uri}-${method}`, { json, status, headers, times })
  }

  has(request) {
    const { url, method = 'GET' } = request

    return this.list.has(`${url}-${method}`)
  }
}

const mocks = new Mocks()

const mockFetch = mocks => {
  window.fetch = jest.fn().mockImplementation(async (url, requestOptions) => {
    const request = { ...requestOptions, url }
    if (!mocks.has(request)) {
      return Response.DEFAULT
    }

    const response = mocks.get(request)
    if (response.times === 0) {
      return Response.DEFAULT
    }

    mocks.add(request, { ...response, times: response.times - 1 })
    return Response.create(response)
  })
}

const http = options => {
  const isHost = !options.request && typeof options === 'string'
  if (isHost) {
    return http({ request: { host: options } })
  }

  return {
    get: path => http({ ...options, request: { ...options.request, path } }),
    post: path => http({ ...options, request: { ...options.request, path, method: 'POST' } }),
    status: status => http({ ...options, response: { ...options.response, status } }),
    headers: headers => http({ ...options, response: { ...options.response, headers } }),
    times: times => http({ ...options, response: { ...options.response, times } }),
    json: json => {
      const { request, response } = options

      mocks.add(request, { ...response, json })
      mockFetch(mocks)
    },
    response: fn => {
      const req = {}
      const res = {
        status: status => {
          options = { ...options, response: { ...options.response, status } }
          return res
        },
        headers: headers => {
          options = { ...options, response: { ...options.response, headers } }
          return res
        },
        json: json => ({ ...options, response: { ...options.response, json } })
      }

      const { request, response } = fn(req, res)

      mocks.add(request, response)
      mockFetch(mocks)
    }
  }
}

afterEach(() => mocks.clear())

export { http }