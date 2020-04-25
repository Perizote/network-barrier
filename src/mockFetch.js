import { Response } from './Response'
import { Mocks } from './Mocks'

const mockFetch = () => {
  window.fetch = jest.fn().mockImplementation(async (url, requestOptions) => {
    const request = { ...requestOptions, url }
    if (!Mocks.has(request)) {
      return Response.DEFAULT
    }

    const response = Mocks.get(request)
    if (response.times === 0) {
      return Response.DEFAULT
    }

    Mocks.add(request, { ...response, times: response.times - 1 })
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

      Mocks.add(request, { ...response, json })
      mockFetch()
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

      Mocks.add(request, response)
      mockFetch()
    }
  }
}

afterEach(Mocks.clear)

export { http }