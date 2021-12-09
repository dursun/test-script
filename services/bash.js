const base = require('./base')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const execSync = require('child_process').execSync
const fs = require('fs')

const RESTRICTED_COMMANDS = ['ssh', 'git']

function bashScript (snippet, result) {
  this.snippet = snippet
  this.result = result
}

function findRestrictedCommands (script) {
  let foundRestrictedCommands = []

  RESTRICTED_COMMANDS.forEach(restrictedCommand => {
    if (script.search(restrictedCommand) !== -1) foundRestrictedCommands.push(restrictedCommand)
  })

  return foundRestrictedCommands
}

async function runBASH (script) {
  const foundRestrictedCommands = findRestrictedCommands(script)

  if (foundRestrictedCommands.length) {
    const snippet = new base.snippet(script, 'bash script has restricted keywords')
    const result = new base.result(null, 'restricted keywords: ' + foundRestrictedCommands.toString(), 'result of bash script')

    return new bashScript(snippet, result)
  }

  // create temporary file using mktemp
  const tempFile = execSync('mktemp /tmp/tmpXXX').toString('ascii').trimEnd()
  try {
    fs.writeFileSync(tempFile, script)
  } catch (err) {
    console.error(err)
  }
  // run shell script
  try {
    const { stdout, stderr } = await exec(`sh ${tempFile}`)
    const snippet = new base.snippet(script, 'bash script')
    const result = new base.result(stdout ? stdout : 'Executed but no output generated for this script', stderr ? stderr : 'No error', 'result of bash script')
    fs.unlink(tempFile, (err) => {
      if (err) console.error(err)
    })
    return new bashScript(snippet, result)
  } catch (err) {
    console.error(`Check bash.js, exec line: ${err}`)
    const snippet = new base.snippet(script, 'bash script')
    const result = new base.result('Check your script or ask the developers', err, 'result of bash script')
    fs.unlink(tempFile, (err) => {
      if (err) console.error(err)
    })

    return new bashScript(snippet, result)
  }
}

module.exports = { runBASH }
