import { Response } from './Response'
import { Mocks } from './Mocks'
import { getConfig } from './config'

const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
}

const barrier = options => {
  if (!options) {
    return barrier({ request: { host: getConfig().host } })
  }
  const isHost = !options.request && typeof options === 'string'
  if (isHost) {
    return barrier({ request: { host: options } })
  }

  return {
    get: path => barrier({ ...options, request: { ...options.request, path, method: HTTP_METHODS.GET } }),
    post: path => barrier({ ...options, request: { ...options.request, path, method: HTTP_METHODS.POST } }),
    put: path => barrier({ ...options, request: { ...options.request, path, method: HTTP_METHODS.PUT } }),
    patch: path => barrier({ ...options, request: { ...options.request, path, method: HTTP_METHODS.PATCH } }),
    delete: path => barrier({ ...options, request: { ...options.request, path, method: HTTP_METHODS.DELETE } }),
    status: status => barrier({ ...options, response: { ...options.response, status } }),
    headers: headers => barrier({ ...options, response: { ...options.response, headers } }),
    times: times => barrier({ ...options, response: { ...options.response, times } }),
    json: json => {
      const { request, response } = options

      Mocks.add(request, { ...response, json })
      window.fetch = jest.fn().mockImplementation(findMatchingResponse)
      return barrier({ ...options, response: { ...options.response, json } })
    },
    blob: blob => {
      const { request, response } = options

      Mocks.add(request, { ...response, blob })
      window.fetch = jest.fn().mockImplementation(findMatchingResponse)
      return barrier({ ...options, response: { ...options.response, blob } })
    },
    text: text => {
      const { request, response } = options

      Mocks.add(request, { ...response, text })
      window.fetch = jest.fn().mockImplementation(findMatchingResponse)
      return barrier({ ...options, response: { ...options.response, text } })
    },
    respond(responseCreator) {
      window.fetch = jest.fn().mockImplementation(async (request, requestOptions) => {
        const url = typeof request === 'string' ? request : request.url
        const response = responseCreator(getReq(url, requestOptions), getRes(options.response))
        Mocks.add(options.request, response)
        return findMatchingResponse(url, requestOptions)
      })
    }
  }
}

const getReq = (url, requestOptions = {}) => ({
  body: getRequestBody(requestOptions),
  headers: getRequestHeaders(requestOptions),
  queryParams: getQueryParams(url),
})

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

function getQueryParams(url) {
  const { searchParams } = new URL(url)
  const urlSearchParams = new URLSearchParams(searchParams)

  return [ ...urlSearchParams.entries() ]
    .reduce((queryParams, [ paramName, paramVAlue ]) => ({
      ...queryParams,
      [ paramName ]: paramVAlue
    }), {})
}

const getRes = response => ({
  status: status => getRes({ ...response, status }),
  headers: headers => getRes({ ...response, headers }),
  json: json => ({ ...response, json }),
  blob: blob => ({ ...response, blob }),
  text: text => ({ ...response, text }),
})

function findMatchingResponse(request, requestOptions) {
  const url = typeof request === 'string' ? request : request.url
  const mockedRequest = { ...requestOptions, url }

  if (!Mocks.has(mockedRequest)) {
    return Response.createDefault()
  }

  const response = Mocks.get(mockedRequest)
  if (response.times === 0) {
    return Response.createDefault()
  }

  Mocks.add(mockedRequest, { ...response, times: response.times - 1 })
  return Response.create(response)
}

afterEach(Mocks.clear)

export { barrier }