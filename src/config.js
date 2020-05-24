let config

function setDefaultHost(host) {
  config = {
    ...config,
    host,
  }
}

const getConfig = () => ({ ...config })

export { setDefaultHost, getConfig }