let config

function setDefaultHost(host) {
  config = {
    ...config,
    host,
  }
}

function setDefaultHeaders(headers) {
  config = {
    ...config,
    headers,
  }
}

const getConfig = () => ({ ...config })

export { setDefaultHost, setDefaultHeaders, getConfig }