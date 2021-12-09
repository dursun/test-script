const { runBASH } = require('./services/bash')
const { runGROOVY } = require('./services/groovy')
const { runPERL } = require('./services/perl')
const { runPYTHON } = require('./services/python')
const { runR } = require('./services/r')

// Route request to specified language using eval
function run (language, script) {
  const runFunction = 'run' + language.toUpperCase()
  const decodedScript = decodeURIComponent(script)

  return eval(runFunction)(decodedScript)
}

module.exports = { run }
