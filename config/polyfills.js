import fetch, { Headers, Request } from 'node-fetch'

global.fetch = fetch
global.Headers = Headers
global.Request = Request