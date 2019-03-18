# @appmonet/tsickle-loader

This is a webpack loader for [tsickle](https://github.com/angular/tsickle); it lets us compile typescript code with the `typescript` compilaer, while adding annotations & externs readable by closure compiler, which means we can use `ADVANCED_OPTIMIZATIONS` mode. See the `test` directory for an example of compiling this way.

## usage

You can use this like any normal webpack loader; it takes a some options:

```javascript
module.exports = {
  module: {
    rules: [
      {
        // you use tsickle-loader in place of typescript-loader;
        // it will compile for you using typescript
        test: /\.ts$/,
        use: {
          loader: "tsickle-loader",
          options: {
            // the tsconfig file to use during compilation
            tsconfig: path.resolve(__dirname, "tsconfig.json"),
            // this is the directory where externs will be saved. You
            // will probably want to delete these between builds
            externDir: "./tmp/externs"
          }
        }
      }
    ]
  }
};
```

## development

To build this project:

- install dependencies `yarn install`
- build the loader `yarn build`
- run tests `yarn test`

Tests use [jest](https://jestjs.io/) and import the build library as javascript from `./lib` -- all tests use [`./test/compiler.js`](tests/compiler.js)
