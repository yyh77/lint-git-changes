const { exec } = require('child_process')
const CLIEngine = require('eslint').CLIEngine
const chalk = require('chalk')

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

process.on('uncaughtException', function (err) {
  console.log(err)
  process.exit(1)
})

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

function normalizeExt (ext) {
  typeof ext === 'string' && (ext = ext.split(/,\s*/))
  return ext.join('|')
}

function lint (options = {}) {
  const defaultOptions = {
    ext: ['js'],
    fix: false
  }
  options = Object.assign({}, defaultOptions, options)

  let cli = new CLIEngine({ fix: options.fix })
  let pass = 0

  console.log('> Staged changes linting...')

  exec(`git diff --cached --name-only | grep -E ".(${normalizeExt(options.ext)})$"`, function (
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
      let array = stdout.split(/\r?\n/)
      array.pop()
      array = array.filter(filePath => !cli.isPathIgnored(filePath))
      const report = cli.executeOnFiles(array)
      let errorCount = 0
      let warningCount = 0
      report.results.forEach(result => {
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
            let lnLength = String(obj.line).length
            let colLength = String(obj.column).length
            let lvlLength = getErrorLevel(obj.severity).length
            let msgLength = obj.message.length
            lnLength > lineLength && (lineLength = lnLength)
            colLength > columnLength && (columnLength = colLength)
            lvlLength > levelLength && (levelLength = lvlLength)
            msgLength > messageLength && (messageLength = msgLength)
          })
          messages.forEach(obj => {
            const level = getErrorLevel(obj.severity)
            let line = String(obj.line).padStart(lineLength)
            let column = String(obj.column).padEnd(columnLength)
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
      options.fix && CLIEngine.outputFixes(report)
      process.exit(pass)
    }
  })
}

module.exports = lint
