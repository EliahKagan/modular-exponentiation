(async function () {
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

    // Construct the Pyodide object, or show an error and abort on failure.
    const pyodide = await (async function () {
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
    })();

    // A simple parameter that does not require any special display logic.
    const Param = class {
        // Creates a simple parameter with an optional range check predicate.
        constructor(name, rangeCheck = undefined) {
            this.input = document.getElementById(`input-${name}`);
            this.output = document.getElementById(`output-${name}`);
            this.value = undefined;

            this.rangeCheck = (rangeCheck === undefined
                                ? _value => true
                                : rangeCheck);
        }

        // Parse input for this parameter. Returns true iff parsing was
        // successful. Updates the corresponding output either way.
        parse() {
            this.value = tryValidateBigInt(this.input.value, this.rangeCheck);
            this._show();
            return this.value !== undefined;
        }

        // Helper for parse(). Updates the output with the value or "???".
        _show() {
            this.output.innerText = (this.value === undefined
                                        ? TEXT.NO_VALUE
                                        : String(this.value));
        }
    };

    // A base parameter: the parameter whose value is raised to an exponent.
    // This is not a base in the sense of inheritance; it derives from Param.
    const BaseParam = class extends Param {
        // Creates a parameter for the base of the exponentiation operation.
        constructor() {
            super('base');

            this._baseParens = Object.freeze(Array.from(
                    document.getElementsByClassName('base-paren')));
        }

        // Overridden helper for parse(). Updates the output with the value or
        // "???", also ensuring that negative values are clear and unambiguous.
        _show() {
            if (this.value !== undefined && this.value < 0n) {
                this._baseParens.forEach(paren =>
                        paren.classList.add('parenthesize'));

                this.output.innerText = `${TEXT.MINUS}${-this.value}`;
            } else {
                this._baseParens.forEach(paren =>
                    paren.classList.remove('parenthesize'));

                super._show();
            }
        }
    };

    // Parameters for all user inputs.
    const params = Object.freeze({
        base: new BaseParam(),
        exponent: new Param('exponent', value => value >= 0n),
        mod: new Param('mod', value => value !== 0n),
    });

    // Python pow function. With three arguments, does modular exponentiation.
    const pow = pyodide.globals.get('pow');

    // The HTML element that the solution will be placed in.
    const outputPower = document.getElementById('output-power');

    // Check inputs and produce whatever outputs are available from them.
    const update = function () {
        let ok = true;

        Object.values(params).forEach(param => {
            // Don't short-circuit: update all, even if some are ill-formed.
            ok = param.parse() && ok;
        });

        if (ok) {
            const power = pow(params.base.value,
                              params.exponent.value,
                              params.mod.value);

            outputPower.innerText = String(power);
        } else {
            outputPower.innerText = TEXT.NO_VALUE;
        }
    };

    Object.values(params).forEach(param =>
        param.input.addEventListener('input', update));

    update();
})();
