const JS_RXP = /\.js$/;
const TS_RXP = /\.ts$/;

export const jsToTS = (path: string | null) =>
  path != null ? path.replace(JS_RXP, ".ts") : "";

export const tsToJS = (path: string | null) =>
  path != null ? path.replace(TS_RXP, ".js") : "";
