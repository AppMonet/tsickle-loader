"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var JS_RXP = /\.js$/;
var TS_RXP = /\.ts$/;
exports.jsToTS = function (path) {
    return path != null ? path.replace(JS_RXP, ".ts") : "";
};
exports.tsToJS = function (path) {
    return path != null ? path.replace(TS_RXP, ".js") : "";
};
