# mako-logger

> A logger to be shared by mako CLI tools.

[![npm version][npm-badge]][npm]
[![npm dependencies][david-badge]][david]
[![npm dev dependencies][david-dev-badge]][david-dev]

## API

This logger is for use by mako-related tools that expose a CLI.

### setLevel([level])

Change the logging level to `level`. Anything higher than the set value will not
be logged.

If no value (or anything falsy) is passed for `level`, the log level will be
reset to the default. (ie: "info")

### getLevel()

Retrieve the current logging level as a string.

### log(level, msg, ...params)

Log with the given `level`. Supports the same interpolation as `util.format()`.

### error(msg, ...params)

Log with the `error` level. Supports the same interpolation as `util.format()`.

**NOTE:** when invoked, `process.exitCode` will be set to 1, which will be used
when the process exits.

### fatal(msg, ...params)

A variant of `error()` that ends the process with exit code 1 immediately after
logging.

### warn(msg, ...params)

Log with the `warn` level. Supports the same interpolation as `util.format()`.

### info(msg, ...params)

Log with the `info` level. Supports the same interpolation as `util.format()`.

### verbose(msg, ...params)

Log with the `verbose` level. Supports the same interpolation as `util.format()`.

### debug(msg, ...params)

Log with the `debug` level. Supports the same interpolation as `util.format()`.

### silly(msg, ...params)

Log with the `silly` level. Supports the same interpolation as `util.format()`.


[david-badge]: https://img.shields.io/david/makojs/logger.svg
[david-dev-badge]: https://img.shields.io/david/dev/makojs/logger.svg
[david-dev]: https://david-dm.org/makojs/logger#info=devDependencies
[david]: https://david-dm.org/makojs/logger
[npm-badge]: https://img.shields.io/npm/v/mako-logger.svg
[npm]: https://www.npmjs.com/package/mako-logger
