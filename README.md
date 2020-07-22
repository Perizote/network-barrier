## Motivation
`network-barrier` blocks HTTP Requests at network level and helps you choose what you want to simulate to have as HTTP Response. It is handy when doing tests that:
- Check API contracts
- To be sure that after an specific `json` response, your UI is gonna be rendered as you expect.

Under the hood, it intercepts the HTTP requests by using the javascript's `Proxy` and lets you do it by exposing a semantic API.

## Getting started
`network-barrier` is **under construction. 🏗** So, please, check the [tests](https://github.com/Perizote/network-barrier/blob/master/tests/barrier.test.js) as documentation until there's a proper `README` file.

Don't forget to reset the network simulation between tests like you can do by using a `jest.config.js` [file](https://github.com/Perizote/network-barrier/blob/master/config/jest.setup.js).

For now, it only works for HTTP Requests using `fetch`.