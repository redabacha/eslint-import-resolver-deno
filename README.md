# eslint-import-resolver-deno

This enables Deno import resolution for `eslint-plugin-import`. This has been tested against Deno v2.0.0.

## Usage

Install this package:

```sh
npm install --save-dev @redabacha/eslint-import-resolver-deno
```

Add the plugin to your eslint configuration file:

```diff
  {
    "rules": {
+     "import/resolver": "@redabacha/eslint-import-resolver-deno",
      // etc...
    },
  },
```

## License

MIT, see [the license file](./LICENSE).
