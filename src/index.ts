import fs from "fs-extra";
import * as path from "path";
import { getOptions, OptionObject } from "loader-utils";
import validateOptions = require("schema-utils");
import tsickle = require("tsickle");
import ts from "typescript";
import { EOL } from "os";
import webpack = require("webpack");
import { fixCode, fixExtern } from "./fix-output";
import { jsToTS, tsToJS } from "./path-utils";
import { TcpSocketConnectOpts } from "net";

const LOADER_NAME = "tsickle-loader";
const DEFAULT_EXTERN_DIR = "dist/externs";
const EXTERNS_FILE_NAME = "externs.js";
const DEFAULT_CONFIG_FILE = "tsconfig.json";

const optionsSchema = {
  type: "object",
  properties: {
    tsconfig: {
      anyOf: [
        {
          type: "string"
        },
        {
          type: "boolean"
        }
      ]
    },
    externDir: {
      type: "string"
    }
  }
};

interface RealOptions extends OptionObject {
  externDir: string;
  tsconfig: string;
  externFile: string;
  compilerConfig: ReturnType<typeof ts.parseJsonConfigFileContent>;
}

const setup = (loaderCTX: webpack.loader.LoaderContext): RealOptions => {
  const options = getOptions(loaderCTX);
  validateOptions(optionsSchema, options, LOADER_NAME);

  const externDir =
    options.externDir != null ? options.externDir : DEFAULT_EXTERN_DIR;
  const externFile = path.resolve(externDir, EXTERNS_FILE_NAME);

  fs.ensureDirSync(externDir);
  const tsconfig =
    typeof options.tsconfig === "string"
      ? options.tsconfig
      : DEFAULT_CONFIG_FILE;

  const compilerConfigFile = ts.readConfigFile(
    tsconfig,
    (configPath: string) => {
      return fs.readFileSync(configPath, "utf-8");
    }
  );

  const compilerConfig = ts.parseJsonConfigFileContent(
    compilerConfigFile.config,
    ts.sys,
    ".",
    {},
    tsconfig
  );

  return {
    tsconfig,
    externDir,
    externFile,
    compilerConfig
  };
};

type LoaderCTX = webpack.loader.LoaderContext;

const handleDiagnostics = (
  ctx: LoaderCTX,
  diagnostics: ReadonlyArray<ts.Diagnostic>,
  diagnosticHost: ts.FormatDiagnosticsHost,
  type: "error" | "warning"
): void => {
  const formatted = ts.formatDiagnosticsWithColorAndContext(
    diagnostics,
    diagnosticHost
  );

  if (type === "error") {
    ctx.emitError(Error(formatted));
  } else {
    ctx.emitWarning(formatted);
  }
};

const tsickleLoader: webpack.loader.Loader = function(
  this: LoaderCTX,
  _source: string | Buffer
) {
  const {
    compilerConfig: { options },
    externFile
  } = setup(this);

  // normalize the path to unix-style
  const sourceFileName = this.resourcePath.replace(/\\/g, "/");
  const compilerHost = ts.createCompilerHost(options);
  const program = ts.createProgram([sourceFileName], options, compilerHost);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  const diagnosticsHost: ts.FormatDiagnosticsHost = {
    getNewLine: () => EOL,
    getCanonicalFileName: fileName => fileName,
    getCurrentDirectory: () => path.dirname(sourceFileName)
  };

  if (diagnostics.length > 0) {
    handleDiagnostics(this, diagnostics, diagnosticsHost, "error");
    return;
  }

  const tsickleHost: tsickle.TsickleHost = {
    shouldSkipTsickleProcessing: (filename: string) =>
      sourceFileName !== filename,
    shouldIgnoreWarningsForPath: () => false,
    pathToModuleName: (name: string) => name,
    fileNameToModuleId: (name: string) => name,
    options: {}, // TODO: set possible options here
    es5Mode: true,
    moduleResolutionHost: compilerHost,
    googmodule: false,
    transformDecorators: true,
    transformTypesToClosure: true,
    typeBlackListPaths: new Set(),
    untyped: false,
    logWarning: warning =>
      handleDiagnostics(this, [warning], diagnosticsHost, "warning")
  };

  const jsFiles = new Map<string, string>();

  const output = tsickle.emitWithTsickle(
    program,
    tsickleHost,
    compilerHost,
    options,
    undefined,
    (path: string, contents: string) => jsFiles.set(path, contents)
  );

  const sourceFileAsJs = tsToJS(sourceFileName);
  for (const [path, source] of jsFiles) {
    if (sourceFileAsJs.indexOf(path) === -1) {
      continue;
    }

    const tsPathName = jsToTS(path);
    const extern = output.externs[tsPathName];
    if (extern != null) {
      // console.info(`appending extern for ${path} to (${externFile}) ::\n${extern}\n`);
      fs.appendFileSync(externFile, fixExtern(extern));
    }

    const fixed = fixCode(source);
    // console.info("FIXED CODE:: \n", fixed);
    return fixed;
  }

  this.emitError(
    Error(`missing compiled result for source file: ${sourceFileName}`)
  );
};

export default tsickleLoader;
