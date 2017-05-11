
1.1.3 / 2017-01-15
==================

  * chore(deps): open loose-envify up to range

1.1.2 / 2016-12-04
==================

  * fix: use same punycode as browserify and url (#100)

1.1.1 / 2016-10-16
==================

  * perf: remove dependencies from tree to eliminate expensive cycle detection

1.1.0 / 2016-10-15
==================

  * fix: handle circular dependencies more gracefully (#91)

1.0.0 / 2016-09-21
==================

  * chore(package): update mako core
  * meta: use npm version for releases
  * docs: clean up readme
  * docs: add contribution guide
  * chore(package): update mako-utils to version 1.0.0 (#86)

0.22.1 / 2016-09-14
===================

  * update mako-utils

0.22.0 / 2016-09-05
===================

  * update mako core, removing internal timers
  * chore(package): update mako-serve to version 0.15.0 (#79)

0.21.12 / 2016-08-31
====================

  * chore(package): update mako-utils to version 0.1.0
  * chore(package): update standard to version 8.0.0 (#77)
  * chore(package): update mocha to version 3.0.0 (#76)
  * example: back to external source maps
  * chore(package): update mako-serve to version 0.14.0 (#75)

0.21.11 / 2016-07-27
====================

  * lint fixes

0.21.10 / 2016-07-27
====================

  * use relative initialPath for mapping id (fixes #73)

0.21.9 / 2016-07-25
===================

  * adding core/modules to config to customize resolve

0.21.8 / 2016-07-25
===================

  * properly handle empty files by specifying encoding during streams

0.21.7 / 2016-06-29
===================

  * add mako-utils

0.21.6 / 2016-06-27
===================

  * no longer adding pkg data to file object (not used)
  * removing cwp

0.21.5 / 2016-06-27
===================

  * switch to cwp instead of relative

0.21.4 / 2016-06-25
===================

  * internal cleanup

0.21.3 / 2016-06-25
===================

  * injecting __filename and __dirname for non-browser builds
  * sorting deps by path instead of id

0.21.2 / 2016-06-25
===================

  * fixing case where resolve failed for non-browser case (fixes #70)
  * update readme with browser and checkSyntax
  * allow disabling the syntax check hook
  * chore(package): update mako-serve to version 0.13.0

0.21.1 / 2016-06-25
===================

  * add missing resolve dep

0.21.0 / 2016-06-25
===================

  * supporting non-browser use-cases

0.20.4 / 2016-06-19
===================

  * formatting existing code with standard
  * switch to standard for linting
  * fixing file.sourcemap in 1 test
  * adding more tests for the cycle problem to prevent regression (fixes #64)
  * chore(package): update mako-buffer to version 0.11.1

0.20.3 / 2016-06-18
===================

  * switching to bluebird internally (fixes #62)
  * cleaning up stream code for better error-handling

0.20.2 / 2016-06-17
===================

  * switching to detective for parsing (fixes #36)
  * update remaining dev deps

0.20.1 / 2016-06-17
===================

  * fixing broken release

0.20.0 / 2016-06-17
===================

  * update mako core
  * clean up readme
  * clean up travis config, prune before update

0.19.1 / 2016-06-12
===================

  * sourceFile should be human-friendly (not uuid)
  * node 4 compat

0.19.0 / 2016-06-12
===================

  * renaming file.sourcemap to file.sourceMap (fixes #26)
  * update punycode
  * update mako core and internals

0.18.1 / 2016-05-25
===================

  * only build shared bundle once

0.18.0 / 2016-05-24
===================

  * update mako core and internals

0.17.0 / 2016-05-17
===================

  * removing mako-sourcemaps, delegating to plugin bundles to add (fixes #23)
  * adding coverage testing
  * chore(package): update mako-copy to version 0.9.0

0.16.0 / 2016-05-15
===================

  * chore(package): update dependencies
  * adding bundle support (fixes #14)

0.15.3 / 2016-05-08
===================

  * roll up mappings during postdependencies (fixes #19)
  * perf: avoid json encoding entire mapping to build

0.15.2 / 2016-03-21
===================

  * sort deps before packing

0.15.1 / 2016-03-06
===================

  * update keywords

0.15.0 / 2016-02-23
===================

  * updating mako core, adding mako-sourcemaps

0.14.0 / 2016-02-10
===================

  * adding tests for circular deps
  * update mako core and dev deps

0.13.3 / 2016-02-01
===================

  * fix support for sub-entries after browser-pack change

0.13.2 / 2016-02-01
===================

  * adding a default source root which should provide a better default devx

0.13.1 / 2016-01-28
===================

  * fixing external source maps and adding test to prevent regression

0.13.0 / 2016-01-24
===================

  * update mako core

0.12.0 / 2016-01-18
===================

  * update buffer module
  * update mako-core, add timers

0.11.0 / 2016-01-03
===================

  * switching to browser-pack

0.10.0 / 2015-12-22
===================

  * deps: bump

0.9.3 / 2015-12-14
==================

  * adding debug output

0.9.2 / 2015-12-13
==================

  * doing more work in postdependencies hook (fixes #11)

0.9.1 / 2015-12-13
==================

  * adding options.resolveOptions

0.9.0 / 2015-12-12
==================

  * supporting additional extensions (fixes #10)

0.8.0 / 2015-12-11
==================

  * adding initial support for source-maps

0.7.2 / 2015-12-11
==================

  * meta: removing superfluous TODO comment (fixes #8)
  * bug: support non-JS dependencies

0.7.1 / 2015-12-07
==================

  * deps: re-adding mako to dev deps

0.7.0 / 2015-12-07
==================

  * deps: update mako and plugins

0.6.0 / 2015-12-06
==================

  * adding syntax-check for better ux

0.5.2 / 2015-12-06
==================

  * clean up isroot check

0.5.1 / 2015-12-04
==================

  * remove superfluous mapping object

0.5.0 / 2015-12-04
==================

  * handle sub-entries

0.4.0 / 2015-12-04
==================

  * support node global variables and environment variables

0.3.0 / 2015-12-03
==================

  * deps: update other deps
  * deps: update mako deps

0.2.0 / 2015-11-15
==================

  * using browser-resolve to improve support

0.1.0 / 2015-11-07
==================

  * adding support for node core module shims

0.0.3 / 2015-11-04
==================

  * meta: adding keywords

0.0.2 / 2015-11-01
==================

  * meta: much cleanup

0.0.1 / 2015-10-31
==================

:sparkles:
