const fs = require('fs-extra')
const path = require('path')
const { getOptions } = require('loader-utils')
const validateOptions = require('schema-utils')
const tsickle = require('tsickle')
const ts = require('typescript')

const optionsSchema = {
  type: 'object',
  properties: {
    tsconfig: {
      anyOf: [
        {
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

const defaultConfigFilename = 'tsconfig.json'
const LOADER_NAME = 'tsickle-loader'

function formatDiagnostics (issues) {
  console.info(issues)
}

module.exports = function (source) {
  const options = getOptions(this)
  validateOptions(optionsSchema, options, LOADER_NAME)

  const externDir =
    options.externDir != null ? options.externDir : 'dist/externs'
  const externFile = path.resolve(externDir, 'externs.js')
  fs.ensureDirSync(externDir)

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
    logWarning: warning =>
      console.error('[tsickle]', formatDiagnostics([warning])),
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
        fs.appendFileSync(externFile, extern)
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
