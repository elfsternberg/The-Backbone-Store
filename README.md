# About

The Backbone Store is a tutorial and demonstration application for
BackboneJS, a javascript framework for managing data-driven websites.

## Installation

After checking out the source code, type

$ make setup all serve

This will automatically run the NPM and Bower install scripts, placing
the correct libraries into the target tree, build the actual application
from the original source material, and start a local server.

## Requirements

The build tool relies upon GNU Make and node-js.  It also uses the NoWeb
Literate Programming documentation tools, and building the documentation
from source requires Xelatex be installed as well.

The command 'make serve' probably only works under a fairly modern
Linux, as it is dependent upon the kernel's inotify facility.

## Branches

There are two major development branches for The Backbone Store.

Branch 'master' uses HTML, CSS, and Javascript.

Branch 'modern' uses HAML, Stylus, and Coffee.

## Changelog

### Changes from 2.0

Version 3.0 has the following notable changes:
 * Replace __super__ with prototype
 * Replace Backbone-generated internal IDs with supplied IDs
 * Updates the use of Deferred
 * Updates to the current Underscore Template mechanism

### Changes from 1.0

Version 2.0 has the following notable changes:
 * Use of jQuery animations
 * Better Styling
 * Proper event management.  Version 1.0 was just doin' it WRONG.

## Copyright

Store.js is entirely my own work, and is Copyright (c) 2010 Elf
M. Sternberg.  Included libraries are covered by their respective
copyright holders, and are used with permission of the licenses
included.  Store.js is intended for educational purposes only, rather
than to be working code, and is hereby licensed under the Creative
Commons Attribution Non-Commercial Share Alike (by-nc-sa) licence.

The images contained herein are derivative works of photographs
licensed under Creative Commons licences for non-commercial purposes.

## Contribution

Please look in backbonestore.nw for the base code.  Backbonestore.nw
is produced using the Noweb Literate Programming toolkit by Norman
Ramsey (http://www.cs.tufts.edu/~nr/noweb/).
