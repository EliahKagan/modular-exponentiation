# modular-exponentiation - a Pyodide demonstration

This is a simple single-page site that uses
[Pyodide](https://pyodide.org/en/stable/) to do big-integer modular
exponentiation with
[`pow`](https://docs.python.org/3/library/functions.html#pow), by running a
Python interpreter in the user’s browser via WebAssembly.

The goal is to be a very simple Pyodide demonstration. This is not really a
reasonable way to do modular exponentiation, other than for demonstration
purposes, since Pyodide is overkill for that. (It takes several seconds to
load, and modular exponentiation can be implemented on JavaScript bigints with
a straightforward recursive function.)

[**Try modular-exponentiation online
here.**](https://eliahkagan.github.io/modular-exponentiation/)

## License

This repository is licensed under [0BSD](https://spdx.org/licenses/0BSD.html).
See [**`LICENSE`**](LICENSE).

## Dependencies

All of modular-exponentiation’s dependencies are obtained via CDN. None
are shipped in this repository.

These libraries are used:

- [Pyodide](https://pyodide.org/en/stable/) 0.23.0, by the [Pyodide
  development team](https://pyodide.org/en/stable/project/about.html) ([Mozilla
  Public License 2.0](https://github.com/pyodide/pyodide/blob/main/LICENSE))
- [*Fork me on GitHub* CSS
  ribbon](https://simonwhitaker.github.io/github-fork-ribbon-css/) 0.2.3 by
  Simon Whitaker ([MIT
  License](https://github.com/simonwhitaker/github-fork-ribbon-css/blob/0.2.3/LICENSE))

And these fonts:

- [IBM Plex Mono](https://www.ibm.com/plex/), designed for IBM by Mike Abbink
  and the [Bold Monday](https://boldmonday.com/custom/ibm/) team ([SIL OFL
  1.1](https://github.com/IBM/plex/blob/master/LICENSE.txt))
- [Nunito](https://github.com/googlefonts/nunito), by The Nunito Project
  Authors, originally by Vernon Adams ([SIL OFL
  1.1](https://github.com/googlefonts/nunito/blob/main/OFL.txt))

## Bugs

In Firefox, reloading the page repeatedly in the same tab (without navigating
away) will—usually gradually—use up more and more memory that is
not freed until the tab is closed. This seems like it may be a bug in Firefox
itself, but the result is that Pyodide cannot always load.
modular-exponentiation’s own user interface should, but does not yet,
detect this situation and inform the user of what to do.

The workarounds are to close the tab and reopen the site in a new tab, which is
usually sufficient, or to close Firefox altogether and reopen it if that does
not work.
