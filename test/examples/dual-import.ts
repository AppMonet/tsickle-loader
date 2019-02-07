// a dual-import to test if our module resolution crap really works
import { singleImport } from "./single-import";
import { importable } from "./imported";
import ComplexObject from "./complex-object";

const win = window as any;

export declare interface InputOptions {
  count: number;
  version: number;
  name: string;
  handler: (objects: InputArg[]) => ComplexObject;
}

declare interface InputArg {
  object: ComplexObject;
  name: string;
}

class MySimpleClass {
  constructor(private factor: number) {}

  getTotal(count: number): number {
    return this.factor * count;
  }
}

win["myRealExport"] = function(opt: InputOptions, factor: number) {
  const instance = new MySimpleClass(factor);
  const cobject = new ComplexObject({
    name: opt.name || "simple-cplx",
    version: opt.version
  });

  return (
    singleImport(instance.getTotal(opt.count)) +
    importable(opt.count) +
    cobject.getIdentifier()
  );
};
