# 2.2.1
 - [Deps] update `define-properties`, `es-abstract`
 - [meta] use `npmignore` to autogenerate an npmignore file
 - [actions] update rebase action to use reusable workflow
 - [Dev Deps] update `aud`, `functions-have-names`, `tape`

# 2.2.0
 - [New] `shim`/`auto`: add `findIndex` to `Symbol.unscopables`
 - [Tests] migrate to tape
 - [Deps] update `es-abstract`
 - [Dev Deps] update `@ljharb/eslint-config`

# 2.1.1
 - [Refactor] update implementation to match spec text
 - [meta] add `safe-publish-latest`
 - [Dev Deps] update `eslint`, `@ljharb/eslint-config`, `aud`, `@es-shims/api`
 - [Tests] migrate tests to Github Actions

# 2.1.0
 - [New] add `auto` entry point
 - [Fix] remove `detect` file, broken/unused in v2
 - [Refactor] use split-up `es-abstract` (77% bundle size decrease)
 - [Performance] avoid checking `arguments` indexes beyond `arguments.length`
 - [Performance] inline `ES.Call` since `IsCallable` is already checked prior to the loop.
 - [Deps] update `define-properties`
 - [meta] Only apps should have lockfiles
 - [meta] add missing LICENSE file
 - [Tests] add `npm run lint`
 - [Tests] use shared travis-ci configs
 - [Tests] use `aud` in posttest

# 2.0.2
 - [Performance] the entry point should use the native function when compliant

# 2.0.1
 - [Fix] use call instead of apply in bound entry point function (#17)
 - [Refactor] Remove unnecessary double ToLength call (#16)
 - [Tests] run tests on travis-ci

# 2.0.0
 - [Breaking] use es-shim API (#13)
 - [Docs] fix example in README (#9)
 - [Docs] Fix npm install command in README (#7)

# 1.0.0
 - [Fix] do not skip holes, per ES6 change (#4)
 - [Fix] Older browsers report the typeof some host objects and regexes as "function" (#5)

# 0.1.1
 - [Fix] Support IE8 by wrapping Object.defineProperty with a try catch (#3)
 - [Refactor] remove redundant enumerable: false (#1)

# 0.1.0
 - Initial release.
