import { importable } from "./imported";

export function singleImport(count: number) {
  return importable(count) - 1;
}
