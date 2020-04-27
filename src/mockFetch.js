import { Response } from './Response'
import { Mocks } from './Mocks'

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

const http = options => {
  const isHost = !options.request && typeof options === 'string'
  if (isHost) {
    return http({ request: { host: options } })
  }

  return {
    get: path => http({ ...options, request: { ...options.request, path, method: HTTP_METHODS.GET } }),
    post: path => http({ ...options, request: { ...options.request, path, method: HTTP_METHODS.POST } }),
    put: path => http({ ...options, request: { ...options.request, path, method: HTTP_METHODS.PUT } }),
    patch: path => http({ ...options, request: { ...options.request, path, method: HTTP_METHODS.PATCH } }),
    delete: path => http({ ...options, request: { ...options.request, path, method: HTTP_METHODS.DELETE } }),
    status: status => http({ ...options, response: { ...options.response, status } }),
    headers: headers => http({ ...options, response: { ...options.response, headers } }),
    times: times => http({ ...options, response: { ...options.response, times } }),
    json: json => {
      const { request, response } = options

      Mocks.add(request, { ...response, json })
      window.fetch = jest.fn().mockImplementation(findMatchingResponse)
    },
    blob: blob => {
      const { request, response } = options

      Mocks.add(request, { ...response, blob })
      window.fetch = jest.fn().mockImplementation(findMatchingResponse)
    },
    text: text => {
      const { request, response } = options

      Mocks.add(request, { ...response, text })
      window.fetch = jest.fn().mockImplementation(findMatchingResponse)
    },
    response(responseCreator) {
      window.fetch = jest.fn().mockImplementation(async (url, requestOptions) => {
        const response = responseCreator(getReq(requestOptions), getRes(options.response))
        Mocks.add(options.request, response)
        return findMatchingResponse(url, requestOptions)
      })
    }
  }
}

const getReq = (requestOptions = {}) => ({
  body: getRequestBody(requestOptions),
  headers: getRequestHeaders(requestOptions),
})

const getRes = response => ({
  status: status => getRes({ ...response, status }),
  headers: headers => getRes({ ...response, headers }),
  json: json => ({ ...response, json }),
  blob: blob => ({ ...response, blob }),
  text: text => ({ ...response, text }),
})

function findMatchingResponse(url, requestOptions) {
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
}

function getRequestBody(requestOptions) {
  if (!requestOptions.body) {
    return {}
  }

  return JSON.parse(requestOptions.body)
}

function getRequestHeaders(requestOptions) {
  if (!requestOptions.headers) {
    return {}
  }

  return requestOptions.headers
}

afterEach(Mocks.clear)

export { http }