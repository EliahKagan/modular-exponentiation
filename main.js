(async function () {
    const TEXT = Object.freeze({
        MINUS: '\u2212',
        NO_VALUE: '???',
    });

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

    const tryValidateBigInt = function (text, rangeCheck) {
        const value = tryParseBigInt(text);
        return value !== undefined && rangeCheck(value) ? value : undefined;
    };

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
        constructor(name, rangeCheck = undefined) {
            this.input = document.getElementById(`input-${name}`);
            this.output = document.getElementById(`output-${name}`);
            this.value = undefined;

            this.rangeCheck = (rangeCheck === undefined
                                ? _value => true
                                : rangeCheck);
        }

        parse() {
            this.value = tryValidateBigInt(this.input.value, this.rangeCheck);
            this._show();
            return this.value !== undefined;
        }

        _show() {
            this.output.innerText = (this.value === undefined
                                        ? TEXT.NO_VALUE
                                        : String(this.value));
        }
    };

    // A base parameter: the parameter whose value is raised to an exponent.
    // This is not a base in the sense of inheritance; it derives from Param.
    const BaseParam = class extends Param {
        constructor() {
            super('base');

            this._baseParens = Object.freeze(Array.from(
                    document.getElementsByClassName('base-paren')));
        }

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

    const params = Object.freeze({
        base: new BaseParam(),
        exponent: new Param('exponent', value => value >= 0n),
        mod: new Param('mod', value => value !== 0n),
    });

    const outputPower = document.getElementById('output-power');

    const computePower = function (base, exponent, mod) {
        return pyodide.runPython(`pow(${base}, ${exponent}, ${mod})`);
    };

    const update = function () {
        let ok = true;

        Object.values(params).forEach(param => {
            // Don't short-circuit: update all, even if some are ill-formed.
            ok = param.parse() && ok;
        });

        if (ok) {
            const power = computePower(params.base.value,
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
