# @monet/tsickle-loader

This is an integration between tsickle and webpack. This lets us compile typescript code
to have annotations readable by closure compiler and an extern file, which means we can use `ADVANCED` mode. See the `test` directory for an example of compiling this way.

## usage

You can use this like any normal webpack loader; it takes a couple of options

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
            tsconfig: path.resolve(__dirname, "tsconfig.json"),
            externDir: "./tmp/externs"
          }
        }
      }
    ]
  }
};
```
