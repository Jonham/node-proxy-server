const express = require('express')
const { Router } = express
const axios = require('axios')

const fs = require('fs')
const streamLogger = fs.createWriteStream('./logger-output.log', {
  flags: 'w+',
  encoding: 'utf-8'
})

const router = Router()
const DEFAULT_PATH = '/proxy'

function LoggerLog (logString, consoleLog) {
  let result = logString || {}

  if (typeof logString !== 'string') {
    try {
      result = JSON.stringify(result)
    } catch (err) {}
  }
  
  let buff = `${new Date()}: ${result}\n`
  if (consoleLog) console.log(buff)

  streamLogger.write(buff)
}

LoggerLog(`default proxy path: ${DEFAULT_PATH}`, 'log')

const DEFAULT_PROXY_PARAMETER = 'proxy_url'

function getProxyUrl (req) {
  return req.headers[DEFAULT_PROXY_PARAMETER] || false
}
function getHeaderToken (req) {
  return req.headers['token']
}

const ALLOW_HEADERS = [
  'token',
  'Content-Type',
  DEFAULT_PROXY_PARAMETER
]
function setDefaultCorsHeader (req, res, next) {
  if (!res) {
    next()
    return
  }

  res.setHeader('access-control-allow-credentials', true)
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS')
  res.setHeader('access-control-allow-headers', ALLOW_HEADERS.join(','))
  if (req.headers['origin']) {
    res.setHeader('access-control-allow-origin', req.headers['origin'])
  }

  next()
}

// set header
router.all(DEFAULT_PATH, setDefaultCorsHeader)

// allow all options
router.options(DEFAULT_PATH, (req, res, next) => {
  res.send('')
})

router.get(DEFAULT_PATH, (req, res, next) => {
  let url = getProxyUrl(req)
  if (url === false) {
    res.json({
      Code: 0,
      Message: 'fail'
    })
    return
  }
  let token = getHeaderToken(req)
  LoggerLog(req.query)

  // res.send(url)
  FetchRemoteServerByGet(url, req.query, token).then(result => {
    res.json(result.data)
  }).catch(err => {
    console.log('ERROR ON GET:')
    LoggerLog('ERROR ON GET:')
    console.log(err)

    res.json({
      Code: 0,
      Message: err.response.data.Message
    })
  })
})

router.post(DEFAULT_PATH, (req, res, next) => {
  let url = getProxyUrl(req)
  if (url == false) {
    res.json({
      Code: 0,
      Message: 'fail'
    })
    return
  }
  let token = getHeaderToken(req)
  LoggerLog('POST: ' + url)

  FetchRemoteServerByPost(url, req.body, token).then(result => {
    res.json(result.data)
  }).catch(err => {
    console.log('ERROR ON POST:')
    LoggerLog('ERROR ON POST:')

    res.json({
      Code: 0,
      Message: err.response.data.Message
    })
  })
})


function FetchRemoteServerByGet (url, body, token) {
  return axios.get(url, {
    params: body,
    headers: {
      token: token || ''
    }
  })
}

function FetchRemoteServerByPost (url, body, token) {
  return axios.post(url, body, {
    headers: {
      token: token || ''
    }
  })
}

module.exports = router