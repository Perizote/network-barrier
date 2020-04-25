import { http } from '../src'

it('should mock a json response body', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json({
      id: 1,
      result: [],
    })

  const response = await (await fetch('http://my.host/my-resource-path/1/')).json()

  expect(response).toEqual({
    id: 1,
    result: [],
  })
})

it('should mock response headers', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .headers({ 'X-Custom-Header': 'a custom header' })
    .json()

  const { headers } = await fetch('http://my.host/my-resource-path/1/')

  expect(headers.get('X-Custom-Header')).toBe('a custom header')
})

it('should mock an ok status by default', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json()

  const { status } = await fetch('http://my.host/my-resource-path/1/')

  expect(status).toBe(200)
})

it('should mock a bad request status', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .status(400)
    .json()

  const { status } = await fetch('http://my.host/my-resource-path/1/')

  expect(status).toBe(400)
})

it('should mock a request which response includes a positive ok', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .status(200)
    .json()
  http('http://my.host/')
    .get('my-resource-path/2/')
    .status(299)
    .json()

  const firstResponse = await fetch('http://my.host/my-resource-path/1/')
  const secondResponse = await fetch('http://my.host/my-resource-path/2/')

  expect(firstResponse.ok).toBeTruthy()
  expect(secondResponse.ok).toBeTruthy()
})

it('should mock a request which response includes a negative ok', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .status(400)
    .json()
  http('http://my.host/')
    .get('my-resource-path/2/')
    .status(500)
    .json()

  const firstResponse = await fetch('http://my.host/my-resource-path/1/')
  const secondResponse = await fetch('http://my.host/my-resource-path/2/')

  expect(firstResponse.ok).toBeFalsy()
  expect(secondResponse.ok).toBeFalsy()
})

it('should not be mocking a request when its url does not match', async () => {
  http('http://not-my.host/')
    .get('not-my-path/')
    .json({
      id: 1,
      result: [],
    })

  const response = await (await fetch('http://my.host/my-resource-path/1/')).json()

  expect(response).not.toBeDefined()
})

it('should mock different requests', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json({
      id: 1,
      result: [],
    })
  http('http://my.host/')
    .get('my-other-resource-path/2/')
    .status(400)
    .json()

  const okResponse = await fetch('http://my.host/my-resource-path/1/')
  const okResponseBody = await (okResponse).json()
  const badRequestResponse = await fetch('http://my.host/my-other-resource-path/2/')
  const badRequestResponseBody = await (badRequestResponse).json()

  expect(okResponse.status).toBe(200)
  expect(okResponseBody).toEqual({
    id: 1,
    result: [],
  })
  expect(badRequestResponse.status).toBe(400)
  expect(badRequestResponseBody).not.toBeDefined()
})

it('should mock the same request url but using different http method', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json({
      id: 1,
      result: [],
    })
  http('http://my.host/')
    .post('my-resource-path/1/')
    .json()

  const responseUsingGet = await (await fetch('http://my.host/my-resource-path/1/')).json()
  const responseUsingPost = await (await fetch('http://my.host/my-resource-path/1/', { method: 'POST' })).json()

  expect(responseUsingGet).toEqual({
    id: 1,
    result: [],
  })
  expect(responseUsingPost).not.toBeDefined()
})

it('should mock the same request multiple times', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .times(2)
    .json({
      id: 1,
      result: [],
    })

  const firstResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()
  const secondResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()

  expect(firstResponse).toEqual({
    id: 1,
    result: [],
  })
  expect(secondResponse).toEqual({
    id: 1,
    result: [],
  })
})

it('should mock the same request one single time by default', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json({
      id: 1,
      result: [],
    })

  const firstResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()
  const secondResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()

  expect(firstResponse).toEqual({
    id: 1,
    result: [],
  })
  expect(secondResponse).not.toBeDefined()
})

// it('should mock the same request multiple times responding differently', async () => {
//   // http('http://my.host/')
//   //   .post('my-resource-path/1/')
//   //   .response({ msg: 'success' })

//     const firstResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()
//     const secondResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()

//     expect(firstResponse).toEqual({
//       id: 1,
//       result: [],
//     })
//     expect(secondResponse).toEqual({
//       id: 1,
//       name: 'Jane Doe',
//     })
// })

it('should mock the response of a request', async () => {
  http('http://my.host/')
    .post('my-resource-path/')
    .response((req, res) =>
      res
        .status(400)
        .headers({ 'X-Custom-Header': 'custom header value' })
        .json({ message: 'Field "name" is required' })
    )

    const response = await fetch('http://my.host/my-resource-path/', { method: 'POST' })
    const responseBody = await (response).json()

    expect(response.status).toBe(400)
    expect(response.ok).toBeFalsy()
    expect(response.headers.get('X-Custom-Header')).toBe('custom header value')
    expect(responseBody).toEqual({ message: 'Field "name" is required' })
})

it('should mock the response of a request by using the default values', async () => {
  http('http://my.host/')
    .post('my-resource-path/')
    .response((req, res) => res.json())

    const response = await fetch('http://my.host/my-resource-path/', { method: 'POST' })
    const responseBody = await (response).json()

    expect(response.status).toBe(200)
    expect(response.ok).toBeTruthy()
    expect(responseBody).not.toBeDefined()
})

it('should mock the same request multiple times', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .times(2)
    .response((req, res) =>
      res
        .json({
          id: 1,
          result: [],
        })
    )

  const firstResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()
  const secondResponse = await (await fetch('http://my.host/my-resource-path/1/')).json()

  expect(firstResponse).toEqual({
    id: 1,
    result: [],
  })
  expect(secondResponse).toEqual({
    id: 1,
    result: [],
  })
})

// it('should mock requests by passing a url wildcard')
// it('should have set a default host')
// it('should mock a request including its query string params')
// it('should mock a request including its url params')
// it('should mock a request including its body params')
// it('should mock a request including its headers')
// it('should mock a blob response body')
// it('should mock a text response body')
// it('should mock an arrayBuffer response body')
// it('should mock different requests by chaining them')