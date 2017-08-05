const { exec } = require('child_process')
const CLIEngine = require('eslint').CLIEngine
const chalk = require('chalk')
const cli = new CLIEngine({})

/**
 *
 * polyfill: string.padStart, string.padEnd
 */

/* eslint-disable no-extend-native */

function pad (targetLength, padString, padTo) {
  targetLength = targetLength >> 0 // floor if number or convert non-number to 0;
  padString = String(padString || ' ')
  if (this.length > targetLength) {
    return String(this)
  } else {
    targetLength = targetLength - this.length
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length) // append to original to ensure we are longer than needed
    }
    if (padTo === 'start') {
      return padString.slice(0, targetLength) + String(this)
    } else if (padTo === 'end') {
      return String(this) + padString.slice(0, targetLength)
    }
  }
}

if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart (targetLength, padString) {
    return pad.call(this, targetLength, padString, 'start')
  }
}

if (!String.prototype.padEnd) {
  String.prototype.padEnd = function padEnd (targetLength, padString) {
    return pad.call(this, targetLength, padString, 'end')
  }
}
// --------------------------------------------------------------------

chalk.enabled = true

function getErrorLevel (number) {
  switch (number) {
    case 2:
      return chalk.red('error')
    case 1:
      return chalk.yellow('warning')
    default:
  }
  return 'undefined'
}

function lint (options = {}) {
  const defaultOptions = {
    ext: ['js']
  }
  let ext = []
  if (options.ext) {
    typeof options.ext === 'string' && (ext = options.ext.split(/,\s*/))
    Array.isArray(options.ext) && (ext = options.ext)
  } else {
    ext = defaultOptions.ext
  }
  ext = ext.join('|')

  let pass = 0

  exec(`git diff --cached --name-only | grep -E ".(${ext})$"`, function (
    error,
    stdout
  ) {
    if (error) {
      let specError = error.message.split(/\r?\n/)[1]
      if (specError) {
        console.log(chalk.red(error))
        process.exit(1)
      }
      process.exit(0)
    }

    if (stdout.length) {
      const array = stdout.split('\n')
      array.pop()
      const results = cli.executeOnFiles(array).results
      let errorCount = 0
      let warningCount = 0
      results.forEach(result => {
        errorCount += result.errorCount
        warningCount += result.warningCount
        let messages = result.messages
        if (messages.length > 0) {
          console.log('\n')
          console.log(chalk.underline.yellow(result.filePath))
          let lineLength = 0
          let columnLength = 0
          let levelLength = 0
          let messageLength = 0
          messages.forEach(obj => {
            let lnLength = obj.line.toString().length
            let colLength = obj.column.toString().length
            let lvlLength = getErrorLevel(obj.severity).length
            let msgLength = obj.message.length
            lnLength > lineLength && (lineLength = lnLength)
            colLength > columnLength && (columnLength = colLength)
            lvlLength > levelLength && (levelLength = lvlLength)
            msgLength > messageLength && (messageLength = msgLength)
          })
          messages.forEach(obj => {
            const level = getErrorLevel(obj.severity)
            let line = obj.line.toString().padStart(lineLength)
            let column = obj.column.toString().padEnd(columnLength)
            console.log(
              `   ${line}:${column}  ${level.padEnd(
                levelLength
              )}  ${obj.message.padEnd(messageLength)}  ${chalk.cyan(
                obj.ruleId
              )}`
            )
          })
          pass = 1
        }
      })
      if (warningCount > 0 || errorCount > 0) {
        console.log(
          chalk.red(
            `\n ✖ ${errorCount +
              warningCount} problems (${errorCount} errors, ${warningCount} warnings)`
          )
        )
      }
      process.exit(pass)
    }
  })
}

module.exports = lint
