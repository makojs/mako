
1.1.6 / 2016-10-25
==================

  * chore(package): update mako-tree

1.1.5 / 2016-10-25
==================

  * chore(utils): fix treeSize for node 7 compat
  * chore(travis): update node versions

1.1.4 / 2016-10-25
==================

  * fix: address incorrect timing for sync plugins

1.1.3 / 2016-10-22
==================

  * fix(runner): resolve relative paths based on root

1.1.2 / 2016-10-22
==================

  * fix(compile): stop hanging during compile when tree is empty
  * fix(runner): resolve relative paths before starting parse/compile/build

1.1.1 / 2016-10-16
==================

  * chore: add timing for tree-operations during precompile

1.1.0 / 2016-10-15
==================

  * feat: allow precompile hook to remove cycles before forcefully doing so
  * test: remove irrelevant tests
  * chore(package): update mako-tree
  * chore: configure greenkeeper to use the 'chore' label
  * chore(package): update chai-as-promised to version 6.0.0
  * docs: add nsp badge

1.0.0 / 2016-09-20
==================

  * meta: use npm version for releases
  * docs: update readme
  * docs: adding contribution guide
  * chore(package): update mako-tree to version 1.0.0 (#57)
  * chore(package): update mako-utils to version 1.0.0 (#56)

0.13.3 / 2016-09-17
===================

  * export Runner to public API (#55)
  * adding docs about Build objects

0.13.2 / 2016-09-13
===================

  * debug: adding size of tree after parse and compile phases

0.13.1 / 2016-09-13
===================

  * update mako-utils
  * cleaning up readme

0.13.0 / 2016-09-05
===================

  * improving internal timing infrastructure (#49)

0.12.20 / 2016-09-01
====================

  * lint: fix new test

0.12.19 / 2016-09-01
====================

  * runner: add options.plugins

0.12.18 / 2016-08-31
====================

  * chore(package): update mako-utils to version 0.1.0

0.12.17 / 2016-08-30
====================

  * chore(package): update standard to version 8.0.0 (#45)
  * chore(package): update mako-tree to version 0.15.0 (#44)
  * chore(package): update mocha to version 3.0.0

0.12.16 / 2016-07-24
====================

  * ensure file is added to parsed list for current build even if it was parsed by another build

0.12.15 / 2016-07-04
====================

  * stop skipping compile phase

0.12.14 / 2016-07-04
====================

  * lint fix

0.12.13 / 2016-07-04
====================

  * experiment with cacheing prior builds for when compile is short-circuited

0.12.12 / 2016-07-02
====================

  * skipping compile for entries with unmodified dependencies
  * skipping compile if no new files were parsed

0.12.11 / 2016-06-29
====================

  * random micro-optimizations
  * restoring default concurrency (100)
  * dropping debug output from queue
  * using mako-utils for relative

0.12.10 / 2016-06-27
====================

  * lint ocd

0.12.9 / 2016-06-27
===================

  * removing cwp

0.12.8 / 2016-06-27
===================

  * switch to cwp instead of relative

0.12.7 / 2016-06-26
===================

  * restoring previous behavior for precompile

0.12.6 / 2016-06-26
===================

  * adding more timers
  * switch back to file props for parse/parsing (fixes #39)
  * bump mako-tree
  * adding a separate timers for parse phase vs parse file
  * no longer setting default concurrency

0.12.5 / 2016-06-26
===================

  * add 'dirty' method to runner

0.12.4 / 2016-06-24
===================

  * ensure files are reset upon being marked dirty

0.12.3 / 2016-06-19
===================

  * bump mako-tree

0.12.2 / 2016-06-19
===================

  * removing dead code
  * converting existing code to standard
  * switch linter/config to standard

0.12.1 / 2016-06-18
===================

  * switch to using bluebird instead of co + native promise (fixes #22)

0.12.0 / 2016-06-15
===================

  * rename "analyze" -> "parse" (fixes #31)
  * rename "assemble" -> "compile" (fixes #31)
  * tracking "parsed", "parsing", etc on runner/build (fixes makojs/tree#12)
  * adding `Build#dirty(file)` to replace `File#dirty()`
  * cleaning up some debug output
  * update mako-tree
  * setting root from runner
  * using a single options object in runner constructor

0.11.1 / 2016-06-10
===================

  * run preassemble hook after pruning tree

0.11.0 / 2016-06-08
===================

  * updating internals to latest mako-tree

0.10.0 / 2016-05-24
===================

  * adding build hooks
  * removing tree argument from file hooks

0.9.2 / 2016-02-23
==================

  * setting default concurrency, adding limits in some phases of build

0.9.1 / 2016-02-23
==================

  * allow prewrite hook to add more files to the tree that will also be passed through the prewrite phase

0.9.0 / 2016-02-21
==================

  * adding more parallelization to the assemble phase, allowing prewrite to modify the tree
  * using a queue during analyze instead of stair-stepping

0.8.4 / 2016-02-17
==================

  * correctly handling larger timing values

0.8.3 / 2016-02-17
==================

  * output timing data longest first

0.8.2 / 2016-02-17
==================

  * adding debug line about preexisting tree
  * update eslint and config

0.8.1 / 2016-02-15
==================

  * pass tree argument through the simple factory

0.8.0 / 2016-02-10
==================

  * removing circular deps before assemble
  * allow defining a predefined tree for a runner

0.7.4 / 2016-02-03
==================

  * updating mako-tree
  * fixing tests

0.7.3 / 2016-02-01
==================

  * fix assemble event names

0.7.2 / 2016-01-27
==================

  * add timer for assemble

0.7.1 / 2016-01-24
==================

  * need to update the tree instance in the build object

0.7.0 / 2016-01-24
==================

  * big internal refactor (see 5f974a283a819906e882d9ac8cf4829792be7f74)

0.6.2 / 2016-01-18
==================

  * create a seperate debug channel for timing

0.6.1 / 2016-01-17
==================

  * cleaning up timing logs

0.6.0 / 2016-01-17
==================

  * adding some internal time tracking

0.5.1 / 2015-12-29
==================

  * changing events naming convention and emitting hook events

0.5.0 / 2015-12-22
==================

  * emitting events on the core builder to allow logging

0.4.3 / 2015-12-15
==================

  * always allowing the preread check to happen, so modifying files between builds will trigger rebuilds

0.4.2 / 2015-12-14
==================

  * removing superfluous debug line

0.4.1 / 2015-12-13
==================

  * adding comments and cleaning up debug output

0.4.0 / 2015-12-07
==================

  * analyze: process deeply-nested deps that are marked dirty
  * deps: updating mako-tree

0.3.2 / 2015-12-03
==================

  * resetting the analyzing flag when an error is thrown by a hook

0.3.1 / 2015-12-01
==================

  * handling transpiled files with changing types more elegantly

0.3.0 / 2015-12-01
==================

  * meta: updating dependencies

0.2.1 / 2015-11-06
==================

  * meta: cleanup

0.2.0 / 2015-10-29
==================

  * updating tree, adding better parallelization
  * making hook setters chainable
  * allow running repeated analyze calls, in either parallel or serial
  * removing internal extensions management

0.1.0 / 2015-10-25
==================

  * bump mako-tree
  * no longer throwing errors for unrecognized file types

0.0.4 / 2015-10-22
==================

  * spending more time in the build phase, adding pre/post dependencies hooks, updating docs

0.0.3 / 2015-10-19
==================

  * ensuring hooks can be set for multiple types

0.0.2 / 2015-10-19
==================

  * bump mako-tree

0.0.1 / 2015-10-18
==================

:sparkles:
