import { http, setDefaultHost } from '../src'
import { readFileAsync } from './helpers'

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
      res.json({
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

it('should mock a request including its body params', async () => {
  http('http://my.host/')
    .post('my-resource-path/')
    .times(2)
    .response((req, res) => {
      if (req.body.isAuth) {
        return res.json({
          id: 1,
          name: 'Jane Doe',
        })
      }

      return res.json()
    })

  const responseWithRequestBody = await (
    await fetch('http://my.host/my-resource-path/', { method: 'POST', body: JSON.stringify({ isAuth: true }) })
  ).json()
  const responseWithoutRequestBody = await (
    await fetch('http://my.host/my-resource-path/', { method: 'POST' })
  ).json()

  expect(responseWithRequestBody).toEqual({
    id: 1,
    name: 'Jane Doe',
  })
  expect(responseWithoutRequestBody).not.toBeDefined()
})

it('should mock a request including its headers', async () => {
  http('http://my.host/')
    .post('my-resource-path/')
    .times(2)
    .response((req, res) => {
      if (req.headers.Authorization === 'Basic mytoken') {
        return res.json({
          id: 1,
          name: 'John Doe',
        })
      }

      return res.json()
    })

  const responseWithRequestHeaders = await (
    await fetch('http://my.host/my-resource-path/', { method: 'POST', headers: { Authorization: 'Basic mytoken' } })
  ).json()
  const responseWithoutRequestHeaders = await (
    await fetch('http://my.host/my-resource-path/', { method: 'POST' })
  ).json()

  expect(responseWithRequestHeaders).toEqual({
    id: 1,
    name: 'John Doe',
  })
  expect(responseWithoutRequestHeaders).not.toBeDefined()
})

it('should mock a put request', async () => {
  http('http://my.host/')
    .put('my-resource-path/1/')
    .json({
      id: 1,
      name: 'Sergio',
    })

  const response = await (await fetch('http://my.host/my-resource-path/1/', { method: 'PUT' })).json()

  expect(response).toEqual({
    id: 1,
    name: 'Sergio',
  })
})

it('should mock a patch request', async () => {
  http('http://my.host/')
    .patch('my-resource-path/1/')
    .json({
      id: 1,
      surname: 'Peris',
    })

  const response = await (await fetch('http://my.host/my-resource-path/1/', { method: 'PATCH' })).json()

  expect(response).toEqual({
    id: 1,
    surname: 'Peris',
  })
})

it('should mock a delete request', async () => {
  http('http://my.host/')
    .delete('my-resource-path/1/')
    .json({
      id: 1,
      address: 'Rodrigo de Pertegas',
    })

  const response = await (await fetch('http://my.host/my-resource-path/1/', { method: 'DELETE' })).json()

  expect(response).toEqual({
    id: 1,
    address: 'Rodrigo de Pertegas',
  })
})

it('should mock a blob response body', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/file.pdf')
    .blob(new Blob(
      [ 'the content of my pdf file' ],
      { type : 'application/pdf' }
    ))

  const pdfFile = await (await fetch('http://my.host/my-resource-path/1/file.pdf')).blob()
  const fileContent = await readFileAsync(pdfFile)

  expect(fileContent).toBe('the content of my pdf file')
})

it('should mock a blob response body of a request', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/file.pdf')
    .response((req, res) =>
      res.blob(new Blob(
        [ 'the content of my pdf file' ],
        { type : 'application/pdf' }
      ))
    )

  const pdfFile = await (await fetch('http://my.host/my-resource-path/1/file.pdf')).blob()
  const fileContent = await readFileAsync(pdfFile)

  expect(fileContent).toBe('the content of my pdf file')
})

it('should mock a text response body', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/file.txt')
    .text(new File(
      [ 'the content of my text file' ],
      'file.txt',
      { type: 'text/plain' }
    ))


  const textFile = await (await fetch('http://my.host/my-resource-path/1/file.txt')).text()
  const fileContent = await readFileAsync(textFile)

  expect(textFile.name).toBe('file.txt')
  expect(fileContent).toBe('the content of my text file')
})

it('should mock a text response body of a request', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/file.txt')
    .response((req, res) =>
      res.text(new File(
        [ 'the content of my text file' ],
        'file.txt',
        { type: 'text/plain' }
      ))
    )

  const textFile = await (await fetch('http://my.host/my-resource-path/1/file.txt')).text()
  const fileContent = await readFileAsync(textFile)

  expect(textFile.name).toBe('file.txt')
  expect(fileContent).toBe('the content of my text file')
})

it('should ignore query string params when it comes to find matching requests', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json({
      id: 1,
      name: 'Sergio',
    })

  const response = await (await fetch('http://my.host/my-resource-path/1/?queryStringParam=value')).json()

  expect(response).toEqual({
    id: 1,
    name: 'Sergio',
  })
})

it('should mock a request including its query string params', async () => {
  http('http://my.host/')
    .get('my-resource-path/')
    .times(2)
    .response((req, res) => {
      if (req.queryParams.order === 'desc') {
        return res.json([ 3, 2, 1 ])
      }

      return res.json([ 1, 2, 3 ])
    })

  const responseWithAscendingOrder = await (await fetch('http://my.host/my-resource-path/')).json()
  const responseWithDescendingOrder = await (await fetch('http://my.host/my-resource-path/?order=desc')).json()

  expect(responseWithAscendingOrder).toEqual([ 1, 2, 3 ])
  expect(responseWithDescendingOrder).toEqual([ 3, 2, 1 ])
})

it('should mock requests by passing a url wildcard', async () => {
  http('http://my.host/')
    .get('my-resource-path/*')
    .json({ name: 'Sergio' })

  const response = await (await fetch('http://my.host/my-resource-path/1/more-stuff/')).json()

  expect(response).toEqual({ name: 'Sergio' })
})

it('should mock different requests by chaining them', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/file.json')
    .json({ content: 'the content of my json file' })
    .get('my-resource-path/1/file.txt')
    .text(new File(
      [ 'the content of my text file' ],
      'file.txt',
      { type: 'text/plain' }
    ))
    .get('my-resource-path/1/file.pdf')
    .blob(new Blob(
      [ 'the content of my pdf file' ],
      { type : 'application/pdf' }
    ))

  const jsonFile = await (await fetch('http://my.host/my-resource-path/1/file.json')).json()
  const textFile = await (await fetch('http://my.host/my-resource-path/1/file.txt')).text()
  const textFileContent = await readFileAsync(textFile)
  const pdfFile = await (await fetch('http://my.host/my-resource-path/1/file.pdf')).blob()
  const pdfFileContent = await readFileAsync(pdfFile)

  expect(jsonFile).toEqual({ content: 'the content of my json file' })
  expect(textFile.name).toBe('file.txt')
  expect(textFileContent).toBe('the content of my text file')
  expect(pdfFileContent).toBe('the content of my pdf file')
})

it('should mock the same request multiple times responding differently', async () => {
  const network = http('http://my.host/')
    .get('my-resource-path/1/')
    .status(400)
    .json()
  const firstResponse =  await fetch('http://my.host/my-resource-path/1/')

  network.response((req, res) =>
    res
      .status(500)
      .json()
  )
  const secondResponse = await fetch('http://my.host/my-resource-path/1/')

  expect(firstResponse.status).toBe(400)
  expect(secondResponse.status).toBe(500)
})

it('should mock a default response including empty json() & text() & blob()', async () => {
  const jsonFile = await (await fetch('http://my.host/my-resource-path/1/file.json')).json()
  const textFile = await (await fetch('http://my.host/my-resource-path/1/file.txt')).text()
  const pdfFile = await (await fetch('http://my.host/my-resource-path/1/file.pdf')).blob()

  expect(jsonFile).not.toBeDefined()
  expect(textFile).not.toBeDefined()
  expect(pdfFile).not.toBeDefined()
})

it('should mock a default response including default values', async () => {
  const response = await fetch('http://my.host/my-resource-path/1/file.json')

  expect(response.headers).toBeDefined()
  expect(() => response.headers.get('X-Not-Existing-Header')).not.toThrow()
  expect(response.status).toBe(200)
  expect(response.ok).toBeTruthy()
})

it('should mock a fetch call when using the Request API', async () => {
  http('http://my.host/')
    .get('my-resource-path/1/')
    .json({ name: 'Sergio' })
  http('http://my.host/')
    .get('my-resource-path/2/')
    .response((req, res) =>
      res.json({ name: 'David' })
    )

  const firstResponse = await (await fetch(new Request('http://my.host/my-resource-path/1/'))).json()
  const secondResponse = await (await fetch(new Request('http://my.host/my-resource-path/2/'))).json()

  expect(firstResponse).toEqual({ name: 'Sergio' })
  expect(secondResponse).toEqual({ name: 'David' })
})

it('should have set a default host', async () => {
  setDefaultHost('http://my.host/')
  http()
    .get('my-resource-path/1/')
    .json([ 1, 2, 3])

  const response = await (await fetch('http://my.host/my-resource-path/1/')).json()

  expect(response).toEqual([ 1, 2, 3])
  setDefaultHost(undefined)
})

// it('should have set a default response headers')
// it('should mock a request failing because of network issues')

// use Proxy API instead of jest.fn().mockImplementation so that we can remove jest peer dependency
// use Deno instead of Node in order to have native fetch support so that we can get rid of node-fetch dependency and polyfills
// find a better name (http sucks)