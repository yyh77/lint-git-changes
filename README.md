# lint-git-changes

![version npm](http://img.shields.io/npm/v/lint-git-changes.svg?style=flat-square)

Run eslint on changed files in your git repo, before git commit. It output results colorfully.

### Installation

```bash
$ npm install lint-git-changes --save-dev
```

or

```bash
$ yarn add lint-git-changes --dev
```

### Usage

It should be used as a script with [pre-commit](https://github.com/observing/pre-commit).

`lint(options)`

#### Options

- `ext` - {String|Array\<string\>}. Configure which files of types will be lint. Default: `"js"`.

#### Example

./foo.js
```js
const lint = require('lint-git-changes')
lint({
  ext: 'js, jsx' // or ['js', 'jsx'] 
})
```

package.json
```json
{
  "script": {
    "lint-changes": "node ./foo.js"
  },
  "pre-commit": "lint-changes"
}
```

### Addition
- `eslint` was considered as a peer dependency.
