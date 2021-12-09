function snippet (script, extraInformation = null) {
  this.script = script
  this.extraInformation = extraInformation
}
function result (stdout, stderr, extraInformation = null) {
  this.stdout = stdout
  this.stderr = stderr
  this.extraInformation = extraInformation
}

module.exports = { snippet, result }
