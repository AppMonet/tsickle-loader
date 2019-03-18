"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Fix some common issues with the tsickle output
 * @param code {string} the transformed typescript code
 * @return {string} transformed code
 */
exports.fixCode = function (code) {
    return code
        .replace(/(?:const|var)\s*.*tsickle_forward_declare_.*\s*=\s*goog\.forwardDeclare.*/g, "")
        .replace(/goog\.require.*/g, "")
        .replace(/tsickle_forward_declare_\d\./g, "");
};
/**
 * Fix some issues with the tsickle extern file definition specific
 * to typescript-in-webpack
 * @param extern {string} the extern definition file content
 * @return {string} transformed code
 */
exports.fixExtern = function (extern) {
    if (extern == null) {
        return "";
    }
    var fixed = extern
        .replace(/var\s*=\s*{};\s*$/gm, "")
        .replace(/^\.(\w+\s+=\s+function.+$)/gm, "var $1")
        .replace(/^\./gm, "");
    return fixed.replace(/([<{])!\.(\w)/gm, "$1!$2");
};
