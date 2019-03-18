declare module "schema-utils" {
  import { OptionObject } from "loader-utils";

  // this just throws
  function validateOptions(
    schema: Record<string, any>,
    options: OptionObject,
    moduleName: string
  ): void;

  export = validateOptions;
}
