const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const process = require('process')
const languageService = require('./language-service')
const base = require('./services/base')

const PORT = 3000
const SUPPORTED_LANGUAGES = ['bash']

// commented-out for now
// const SUPPORTED_LANGUAGES = ['bash', 'groovy', 'perl', 'python', 'r']

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Custom-Header')
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})

app.post('/script/test/:language', function (req, res) {
  const language = req.params.language.toLowerCase()
  const matches = SUPPORTED_LANGUAGES.filter(supportedLanguage => supportedLanguage.includes(language))
  if (!matches || matches.length === 0) {
    res.status(404)
    const snippet = new base.snippet(null, `unsupported language: ${language}`)
    const result = new base.result(null, null, null)
    res.send({
      snippet: snippet,
      result: result
    })
    return
  }
  const script = req.body.script
  if (!script) {
    res.status(422)
    const snippet = new base.snippet(script, 'empty code')
    const result = new base.result(null, null, null)
    res.send({
      snippet: snippet,
      result: result
    })
    return
  }
  // Send script to the specified language
  languageService.run(language, script)
    .then(function (result) {
      res.status(200)
      res.send(result)
    })
    .catch(function (err) {
      res.status(500)
      const snippet = new base.snippet(script, `internal server error: ${err}`)
      const result = new base.result(null, null, null)
      res.send({
        snippet: snippet,
        result: result
      })
    })
})

app.listen(process.env.PORT || PORT, () => console.log(`Listening at ${PORT}`))
