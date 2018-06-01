const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const router = require('./router.js')

const app = express()
const HOST = process.env.HOST || '0.0.0.0'
const PORT = process.env.PORT || '18601'

app.set('port', PORT)

app.use(bodyParser.json())
app.use(cookieParser())
app.use(router)


app.listen(PORT, HOST)
console.log('Server listening on ' + HOST + ':' + PORT) // eslint-disable-line no-console