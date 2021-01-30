const rp = require('request-promise')
const environments = require('../environments/environments')

const api = (NODE_ENV) => {
  const get = (url, key) => {
    const uri = `${environments[NODE_ENV].apiUrl}/${url}`
    return rp({
      uri,
      headers: {
        'Authorization': key ? `Bearer ${key}` : undefined
      }
    })
      .then(r => JSON.parse(r))
  }

  const post = (url, payload, key) => {
    const uri = `${environments[NODE_ENV].apiUrl}/${url}`
    return rp({
      uri,
      headers: {
        'Authorization': key ? `Bearer ${key}` : undefined,
        'Content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(payload)
    })
      .then(r => JSON.parse(r))
  }

  const patch = (url, payload, key) => {
    const uri = `${environments[NODE_ENV].apiUrl}/${url}`
    return rp({
      uri,
      headers: {
        'Authorization': key ? `Bearer ${key}` : undefined,
        'Content-type': 'application/json'
      },
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
      .then(r => JSON.parse(r))
  }

  return {
    get,
    post,
    patch
  }
}

module.exports = api
