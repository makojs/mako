
3.0.0 / 2016-11-10
==================

  * BREAKING CHANGE: updating mako cache + config (#68)
  * feat: change default config file to `.makorc`
  * feat: add support for `package.json` config
  * feat: use temporary directory for cache files

2.0.1 / 2016-10-25
==================

  * chore(package): update mako and mako-watch
  * chore(package): update mako-cache

2.0.0 / 2016-10-23
==================

  * feat: JS API overhaul, adding livereload as first-class feature (#60)

1.1.3 / 2016-10-16
==================

  * fix: handle entries properly during watch rebuild

1.1.2 / 2016-10-16
==================

  * perf: rebuild only entries reachable from changed file

1.1.1 / 2016-10-15
==================

  * fix: do not use changed file as entry

1.1.0 / 2016-09-26
==================

  * refactor: cleaning up internals, using mako-logger

1.0.0 / 2016-09-21
==================

  * chore(package): update mako watch
  * chore(package): update mako deps
  * meta: add license
  * meta: use npm version for releases
  * docs: clean up readme
  * docs: add contribution guide

0.17.0 / 2016-09-14
===================

  * add support for using a custom path other than cwd (fixes #44) (#46)
  * add basic livereload support to the CLI (fixes #29) (#45)

0.16.4 / 2016-09-14
===================

  * update mako-utils

0.16.3 / 2016-09-11
===================

  * mark files dirty before rebuilding

0.16.2 / 2016-09-10
===================

  * stop outputting entries in cli
  * chore(package): update koa to version 1.2.3 (#42)

0.16.1 / 2016-09-05
===================

  * update mako watch

0.16.0 / 2016-09-05
===================

  * update mako core

0.15.0 / 2016-09-03
===================

  * major refactor: using watch for internals rather than building on-demand (#34)
  * chore(package): update mako-utils to version 0.1.0
  * chore(package): update standard to version 8.0.0 (#31)
  * chore(package): update mocha to version 3.0.0 (#28)

0.14.1 / 2016-07-29
===================

  * do not throw, so other middleware can still be used

0.14.0 / 2016-07-29
===================

  * add support for serving files that are added during build phase

0.13.8 / 2016-07-22
===================

  * load dependants recursively

0.13.7 / 2016-07-22
===================

  * properly serve dependency output files
  * adding code style badge

0.13.6 / 2016-07-02
===================

  * handle upstream changes that cause compile to skip when files are not modified

0.13.5 / 2016-06-29
===================

  * add mako-utils

0.13.4 / 2016-06-27
===================

  * chore(package): update mako-cache to version 0.4.0 (#24)

0.13.3 / 2016-06-27
===================

  * removing cwp

0.13.2 / 2016-06-27
===================

  * switch to cwp instead of relative

0.13.1 / 2016-06-22
===================

  * use yield next to allow fallthrough as designed

0.13.0 / 2016-06-22
===================

  * do not throw for a missing file, simply let it fall through
  * add bluebird, wrapping promise from mako

0.12.5 / 2016-06-19
===================

  * formatting existing code using standard
  * switching to standard for linting

0.12.4 / 2016-06-17
===================

  * default root to pwd

0.12.3 / 2016-06-17
===================

  * chore(package): update mako-config to version 0.4.0

0.12.2 / 2016-06-17
===================

  * cleaning up root handling

0.12.1 / 2016-06-17
===================

  * fixing entry file output

0.12.0 / 2016-06-17
===================

  * update mako core
  * clean up travis config, prune before update

0.11.1 / 2016-06-12
===================

  * fixing logs on startup

0.11.0 / 2016-06-11
===================

  * update mako core, cleaning up internals

0.10.0 / 2016-05-25
===================

  * update mako core

0.9.3 / 2016-05-15
==================

  * chore(package): update dependencies

0.9.2 / 2016-03-06
==================

  * update keywords

0.9.1 / 2016-02-24
==================

  * bugfix for cache save

0.9.0 / 2016-02-24
==================

  * improving cache support

0.8.0 / 2016-02-23
==================

  * update mako core

0.7.1 / 2016-02-17
==================

  * improve cache loading
  * update eslint and config

0.7.0 / 2016-02-10
==================

  * update mako core and dev deps

0.6.4 / 2016-02-04
==================

  * removing auto-redirect

0.6.3 / 2016-02-04
==================

  * redirecting the root url to the first entry

0.6.2 / 2016-01-31
==================

  * improving error logging

0.6.1 / 2016-01-24
==================

  * fix bug after updating mako core

0.6.0 / 2016-01-24
==================

  * update mako core

0.5.0 / 2016-01-18
==================

  * update mako core

0.4.0 / 2015-12-22
==================

  * deps: update

0.3.1 / 2015-12-14
==================

  * deps: adding debug

0.3.0 / 2015-12-14
==================

  * adding debug output, yielding when file not recognized (fixes #1)
  * using config sync

0.2.0 / 2015-12-07
==================

  * deps: update mako and plugins

0.1.0 / 2015-12-07
==================

  * internal overhaul

0.0.1 / 2015-11-09
==================

:sparkles:
