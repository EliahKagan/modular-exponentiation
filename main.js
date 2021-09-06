// Copyright (C) 2021 Eliah Kagan <degeneracypressure@gmail.com>
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

(async function () {
    'use strict';

    // Literal text will sometimes be placed in output fields.
    const TEXT = Object.freeze({
        MINUS: '\u2212',
        NO_VALUE: '???',
    });

    // Parses text as a bigint (returning undefined on failure).
    const tryParseBigInt = function (text) {
        text = text.trim();

        if (text.length === 0) {
            return undefined; // Refuse to parse an empty string as zero.
        }

        try {
            return BigInt(text);
        } catch (error) {
            if (error instanceof SyntaxError) {
                return undefined; // The input did not look like an integer.
            } else {
                throw error;
            }
        }
    };

    // Parses text as a bigint, validating with a rangeCheck predicate.
    const tryValidateBigInt = function (text, rangeCheck) {
        const value = tryParseBigInt(text);
        return value !== undefined && rangeCheck(value) ? value : undefined;
    };

    // Constructs the Pyodide object. Shows a message and rethrows on failure.
    const tryLoadPyodide = async function () {
        const status = document.getElementById('status');
        let ret;

        try {
            ret = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/',
            });
        } catch (error) {
            status.innerText = 'Oh no, Pyodide failed to load!';
            status.classList.add('error');
            throw error;
        }

        status.innerText = 'Pyodide loaded successfully!';
        status.classList.add('loaded');
        return ret;
    };

    // A simple output parameter.
    const OutputParam = class {
        // Creates a simple output parameter.
        constructor(name) {
            this.output = document.getElementById(`output-${name}`);
            this.value = undefined;
        }

        // Sets the value of this parameter. Should be a bigint or undefined.
        // Updates the corresponding output.
        set(value) {
            this.value = value;
            this._show();
        }

        // Updates the output.
        _show() {
            this.output.innerText = this._format();
        }

        // Formats the value (or absence therefore) to be shown in the UI.
        _format() {
            if (this.value === undefined) {
                return TEXT.NO_VALUE;
            } else if (this.value < 0n) {
                return `${TEXT.MINUS}${-this.value}`;
            } else {
                return String(this.value);
            }
        }
    };

    // A simple input/output parameter.
    const Param = class extends OutputParam {
        // Creates a simple parameter with an optional range check predicate.
        constructor(name, rangeCheck = undefined) {
            super(name);

            this.input = document.getElementById(`input-${name}`);

            this.rangeCheck = (rangeCheck === undefined
                                ? _value => true
                                : rangeCheck);
        }

        // Parse input for this parameter. Returns true iff parsing was
        // successful. Updates the corresponding output either way.
        parse() {
            this.set(tryValidateBigInt(this.input.value, this.rangeCheck));
            return this.value !== undefined;
        }
    };

    // A base parameter: the parameter whose value is raised to an exponent.
    // This is not a base in the sense of inheritance; it *derives* from Param.
    const BaseParam = class extends Param {
        // Creates a parameter for the base of the exponentiation operation.
        constructor() {
            super('base');

            this._baseParens = Object.freeze(Array.from(
                    document.getElementsByClassName('base-paren')));
        }

        // Updates the output. Parenthesizes the base iff negative.
        _show() {
            if (this.value !== undefined && this.value < 0n) {
                this._baseParens.forEach(paren =>
                        paren.classList.add('parenthesize'));
            } else {
                this._baseParens.forEach(paren =>
                    paren.classList.remove('parenthesize'));
            }

            super._show();
        }
    };

    // Python pow function. With three arguments, does modular exponentiation.
    const pow = (await tryLoadPyodide()).globals.get('pow');

    // Parameters for all user inputs.
    const inputParams = Object.freeze({
        base: new BaseParam(),
        exponent: new Param('exponent', value => value >= 0n),
        mod: new Param('mod', value => value !== 0n),
    });

    // The output parameter for the solution.
    const power = new OutputParam('power');

    // Check inputs and produce whatever outputs are available from them.
    const update = function () {
        let ok = true;

        Object.values(inputParams).forEach(param => {
            // Don't short-circuit: update all, even if some are ill-formed.
            ok = param.parse() && ok;
        });

        if (ok) {
            power.set(pow(inputParams.base.value,
                          inputParams.exponent.value,
                          inputParams.mod.value));
        } else {
            power.set(undefined);
        }
    };

    Object.values(inputParams).forEach(param =>
        param.input.addEventListener('input', update));

    update();
})();
