
1.6.0 / 2016-11-09
==================

  * feat(file): add ability to reset path history for copied files (#36)
  * feat(file): add File.id (#35)

1.5.0 / 2016-11-09
==================

  * feat(file): add copy method (#34)

1.4.0 / 2016-11-02
==================

  * feat(tree): improve error messages

1.3.1 / 2016-10-23
==================

  * chore(package): update graph.js

1.3.0 / 2016-10-14
==================

  * feat(tree): allow prune to work on a cyclic tree
  * fix(tree): change remove cycles iteration to be more deterministic

1.2.0 / 2016-10-08
==================

  * feat(tree): implement Iterable interface

1.1.1 / 2016-10-03
==================

  * chore: switch to babel-polyfill-safer to address npm install warning

1.1.0 / 2016-09-29
==================

  * chore(package): update vinyl to version 2.0.0 (#28)

1.0.2 / 2016-09-26
==================

  * refactor(deps): update file-extension to version 3.0.2 (#26)

1.0.1 / 2016-09-25
==================

  * fix: properly handle files without an extension (#23)

1.0.0 / 2016-09-19
==================

  * use npm version to create new releases
  * adding contributor guidelines
  * bump mako-utils
  * clean up readme urls

0.15.3 / 2016-09-13
===================

  * update mako-utils
  * Update docs about `File#time` since it is both get/set

0.15.2 / 2016-08-31
===================

  * chore(package): update mako-utils to version 0.1.0

0.15.1 / 2016-08-30
===================

  * cloning should preserve the root
  * chore(package): update standard to version 8.0.0 (#18)

0.15.0 / 2016-08-10
===================

  * update vinyl: use improved clone method and constructor logic

0.14.11 / 2016-07-02
====================

  * add support for recursively checking for dependency relationships

0.14.10 / 2016-06-29
====================

  * internal optimizations
  * dropping defaults module
  * simplifying File.fromObject()
  * simplifying some property get/set
  * adding mako-utils

0.14.9 / 2016-06-27
===================

  * lint ocd

0.14.8 / 2016-06-27
===================

  * removing cwp

0.14.7 / 2016-06-27
===================

  * switch to cwp instead of relative

0.14.6 / 2016-06-26
===================

  * ensure root defaults to pwd

0.14.5 / 2016-06-26
===================

  * adding more timer-based debug logs

0.14.4 / 2016-06-19
===================

  * formatting existing code to standard
  * switch to standard for linting

0.14.3 / 2016-06-19
===================

  * consider vertex degree when removing cycles

0.14.2 / 2016-06-18
===================

  * file: reset changes contents to null (fixes #16)

0.14.1 / 2016-06-16
===================

  * clone: deep-copying the complex properties

0.14.0 / 2016-06-14
===================

  * remove `File#dirty()`, add `File#reset()`

0.13.1 / 2016-06-13
===================

  * ensure that going to and from JSON preserves root

0.13.0 / 2016-06-13
===================

  * support a global tree root (fixes #15)

0.12.3 / 2016-06-11
===================

  * fixing recursive loop during clone

0.12.2 / 2016-06-11
===================

  * cleaning up debug output

0.12.1 / 2016-06-07
===================

  * add object support to findFile

0.12.0 / 2016-06-07
===================

  * File now based on Vinyl
  * many API changes (refer to README)

0.11.4 / 2016-03-06
===================

  * update keywords

0.11.3 / 2016-02-15
===================

  * cleaning up stringified tree

0.11.2 / 2016-02-11
===================

  * adding debug output

0.11.1 / 2016-02-11
===================

  * adding safe babel polyfill (ugly hack)

0.11.0 / 2016-02-10
===================

  * adding a method for removing cycles from a tree

0.10.1 / 2016-02-09
===================

  * adding ability to forcibly remove a file from the tree

0.10.0 / 2016-02-08
===================

  * adding to/from string methods

0.9.2 / 2016-02-08
==================

  * update toposort

0.9.1 / 2016-02-03
==================

  * adding file dependant methods

0.9.0 / 2016-02-03
==================

  * adding dependant methods (the companions to the dependency methods)

0.8.2 / 2016-01-28
==================

  * optimizing the prune method

0.8.1 / 2016-01-27
==================

  * improving debug output

0.8.0 / 2016-01-23
==================

  * removing timers, that will be moved to a build tracking object

0.7.1 / 2016-01-18
==================

  * do not clone stat maps, they don't really end up being useful between builds

0.7.0 / 2016-01-17
==================

  * adding timing utilities to file (recording) and tree (aggregating)

0.6.3 / 2015-12-13
==================

  * fixing debug with dep counts

0.6.2 / 2015-12-13
==================

  * adding comments, debug always uses relative paths

0.6.1 / 2015-12-07
==================

  * fixing getFiles with both topological and objects options passed

0.6.0 / 2015-12-05
==================

  * adding `Tree#getFiles()`
  * removing `Tree#topologicalOrder()`
  * adding `options` argument to `Tree#getFiles()`
  * replacing `recursive` with `options` argument in `Tree#dependenciesOf()` and `Tree#dependantsOf()`
  * adding `options.objects` to `Tree#getFiles()`, `Tree#getEntries()`, `Tree#dependenciesOf()` and `Tree#dependantsOf()`

0.5.2 / 2015-12-01
==================

  * adding method to retrieve file original type

0.5.1 / 2015-12-01
==================

  * do not throw if analyzing is true, it always will be during the preread phase

0.5.0 / 2015-12-01
==================

  * adding ability to mark a file as dirty externally

0.4.1 / 2015-10-29
==================

  * allowing prune to remove files not able to reach a specific list of entries

0.4.0 / 2015-10-28
==================

  * adding tree.prune() to enable cleaning up orphaned files
  * restoring concept of entries internally
  * added cloning capability

0.3.2 / 2015-10-27
==================

  * only create new file objects if needed

0.3.1 / 2015-10-26
==================

  * bump file-extension

0.3.0 / 2015-10-24
==================

  * added: `tree.getEntries([from])` which filters out entries unreachable from the given `from` file

0.2.0 / 2015-10-22
==================

  * internal: flipping edge direction (deps now flow to entries)
  * renamed: `tree.getSources()` to `tree.getEntries()`
  * renamed: `tree.isSource()` to `tree.isEntry()`
  * renamed: `file.isSource()` to `file.isEntry()`
  * added: `tree.topologicalOrder()`

0.1.1 / 2015-10-19
==================

  * updating readme and changelog

0.1.0 / 2015-10-18
==================

  * added: helper methods to `File` for working with tree
  * added: `Tree#isSource()`

0.0.1 / 2015-10-18
==================

:sparkles:
