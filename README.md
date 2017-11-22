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

It should be used as a script with [husky](https://github.com/typicode/husky) or [pre-commit](https://github.com/observing/pre-commit).

`lint(options)`

#### Options

- `ext` - {String | Array\<String\>}. Files which matched the configured extensions will be lint. Default: `"js"`.
- `fix` - {Boolean}. Whether fix the codes automatically. Default: `false`.
- `dir` - {String}. Choose the directory(relative path to project dir) to lint.

#### Example

./foo.js
```js
const lint = require('lint-git-changes')
lint({
  ext: 'js, jsx' // or ['js', 'jsx'] 
})
```

package.json

*used with [husky](https://github.com/typicode/husky), please install it first.*
```json
{
  "script": {
    "precommit": "node ./foo.js"
  }
}
```

### Addition
- `eslint` was considered as a peer dependency.
