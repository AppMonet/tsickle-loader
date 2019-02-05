export declare interface ComplexObjectOpt {
  name: string;
  version: number;
}

export default class CompleObject {
  private name: string;
  private version: number;

  constructor(opt: ComplexObjectOpt) {
    this.name = opt.name;
    this.version = opt.version;
  }

  public getIdentifier(): string {
    return `${this.name}@${this.version}`;
  }
}
