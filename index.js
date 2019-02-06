const fs = require('fs-extra')
const path = require('path')
const {
  getOptions
} = require('loader-utils')
const validateOptions = require('schema-utils')
const tsickle = require('tsickle')
const ts = require('typescript')

const optionsSchema = {
  type: 'object',
  properties: {
    tsconfig: {
      anyOf: [{
          type: 'string'
        },
        {
          type: 'boolean'
        }
      ]
    },
    externDir: {
      type: 'string'
    }
  }
}

const fixExtern = (extern) => {
  if (extern == null) {
    return null
  }

  const fixed = extern.replace(/var\s*=\s*{};\s*$/gm, '')
    .replace(/^\./gm, '')

  return fixed
}

const defaultConfigFilename = 'tsconfig.json'
const LOADER_NAME = 'tsickle-loader'
const ResetColor = '\x1b[0m'
const ErrorColor = '\x1b[41m\x1b[37m'
const WarningColor = '\x1b[43m\x1b[30m'

const formatDiagnostics = (issues, type) => {
  type = type || 'error'
  issues.forEach(issue => {
    const code = issue.file.text
    const endIssue = issue.start + issue.length

    const color = type === 'error' ? ErrorColor : WarningColor
    const colorized =
      '\t' +
      (
        code.slice(Math.max(issue.start - 80, 0), issue.start) +
        color +
        code.slice(issue.start, issue.start + issue.length) +
        ResetColor +
        code.slice(endIssue, endIssue + 80)
      ).replace(/\n/g, '\n\t')

    const msg = `[${type}] - ${issue.file.path}`
    const line = '-'.repeat(msg.length)

    console.log(msg)
    const space = Math.max(msg.length - (issue.messageText.length + 3), 0)

    console.log(issue.messageText + ' '.repeat(space) + '👇👇👇\n')
    console.log(line)
    console.log(colorized)
    console.log(line)
  })
}

module.exports = function (source) {
  const options = getOptions(this)
  validateOptions(optionsSchema, options, LOADER_NAME)

  const externDir =
    options.externDir != null ? options.externDir : 'dist/externs'
  const externFile = path.resolve(externDir, 'externs.js')
  console.info('writing externs to %s', externFile)

  fs.ensureDirSync(externDir)
  if (fs.existsSync(externFile)) {
    // fs.unlinkSync(externFile)
  }

  const configFileName =
    options.tsconfig != null ? options.tsconfig : defaultConfigFilename

  const sourceFile = this.resourcePath.replace(/\\/g, '/')

  const config = ts.readConfigFile(configFileName, function (path) {
    return fs.readFileSync(path, 'utf-8')
  })

  const sysOps = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    '.',
    [],
    configFileName
  )

  const compilerHost = ts.createCompilerHost(sysOps.options)
  const program = ts.createProgram([sourceFile], sysOps.options, compilerHost)
  const diagnostics = ts.getPreEmitDiagnostics(program)

  if (diagnostics.length > 0) {
    this.emitError(formatDiagnostics(diagnostics))
    return
  }

  const jsFiles = {}
  const transformerHost = {
    shouldSkipTsickleProcessing: fileName => sourceFile !== fileName,
    shouldIgnoreWarningsForPath: fileName => false,
    pathToModuleName: name => name,
    fileNameToModuleId: fileName => fileName,
    es5Mode: true,
    googmodule: false,
    prelude: '',
    transformDecorators: true,
    transformTypesToClosure: true,
    typeBlackListPaths: new Set(),
    untyped: false,
    logWarning: warning => formatDiagnostics([warning]),
    noForwardDeclare: true
  }

  const result = tsickle.emitWithTsickle(
    program,
    transformerHost,
    compilerHost,
    options,
    undefined,
    (path, contents) => {
      jsFiles[path] = contents
    }
  )

  const sourceFileJs = sourceFile.replace(/\.ts$/, '.js')
  for (const key in jsFiles) {
    if (sourceFileJs.indexOf(key) !== -1) {
      const tsKey = key.replace(/\.js$/, '.ts')
      const extern = result.externs[tsKey]

      if (extern) {
        fs.appendFileSync(externFile, fixExtern(extern))
      }

      let resultText = jsFiles[key]
      resultText = resultText.replace(
        /(?:const|var)\s*.*tsickle_forward_declare_.*\s*=\s*goog\.forwardDeclare.*/g,
        ''
      )
      resultText = resultText.replace(/goog\.require.*/g, '')
      resultText = resultText.replace(/tsickle_forward_declare_\d\./g, '')
      return resultText
    }
  }

  console.error('we were not able to find the result... oh man!')
  throw Error('invalid')
}