/**
 * Fix some common issues with the tsickle output
 * @param code {string} the transformed typescript code
 * @return {string} transformed code
 */
export const fixCode = (code: string): string => {
  return code
    .replace(/^\s*var\s*tsickle.+=.*goog\.requireType.*$/g, "")
    .replace(
      /(?:const|var)\s*.*tsickle_forward_declare_.*\s*=\s*goog\.forwardDeclare.*/g,
      ""
    )
    .replace(/!\.(\w)/gm, "!$1")
    .replace(/goog\.require.*/gm, "")
    .replace(/tsickle_forward_declare_\d\./gm, "")
    .replace(/var\s* tsickle_.+=\s+/g, "");
};

/**
 * Fix some issues with the tsickle extern file definition specific
 * to typescript-in-webpack
 * @param extern {string} the extern definition file content
 * @return {string} transformed code
 */
export const fixExtern = (extern: string | null): string => {
  if (extern == null) {
    return "";
  }

  const fixed = extern
    .replace(/var\s*=\s*{};\s*$/gm, "")
    .replace(/!\.(\w)/gm, "!$1")
    .replace(/^\.(\w+\s+=\s+{}\s*;?\s*$)/gm, "var $1")
    .replace(/^\.(\w+\s+=\s+function.+$)/gm, "var $1")
    .replace(/^\.(\w+\s*;\s*$)/gm, "var $1")
    .replace(/^\./gm, "");

  return fixed.replace(/([<{])!\.(\w)/gm, "$1!$2");
};
