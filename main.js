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
    }

    const tryValidateBigInt = function (text, rangeCheck) {
        const value = tryParseBigInt(text);
        return value !== undefined && rangeCheck(value) ? value : undefined;
    }

    const pyodide = await (async function () {
        const status = document.getElementById('status');
        let ret = undefined;

        try {
            ret = await loadPyodide({
                indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/',
            });
        } catch (error) {
            status.innerText = 'Oh no, pyodide failed to load!';
            status.classList.add('error');
            throw error;
        }

        status.innerText = 'pyodide loaded successfully!';
        status.classList.add('loaded');
        return ret;
    })();

    const baseParens = Object.freeze(Array.from(
            document.getElementsByClassName('base-paren')));

    const displayNormally = function (paramData) {
        paramData.output.innerText = (paramData.value === undefined
                                        ? TEXT.NO_VALUE
                                        : String(paramData.value));
    }

    const showBase = function () {
        if (this.value !== undefined && this.value < 0n) {
            baseParens.forEach(paren => paren.classList.add('parenthesize'));
            this.output.innerText = `${TEXT.MINUS}${-this.value}`;
        } else {
            baseParens.forEach(paren => paren.classList.remove('parenthesize'));
            displayNormally(this);
        }
    };

    const params = Object.freeze((function () {
        const ret = {};

        ['base', 'exponent', 'mod'].forEach(param => {
            ret[param] = {
                input: document.getElementById(`input-${param}`),
                output: document.getElementById(`output-${param}`),
                value: undefined,
                rangeCheck: _value => true, // Default is no range check.
                show: function () { displayNormally(this); },
            };
        });

        ret.base.show = showBase;
        ret.exponent.rangeCheck = value => value >= 0n;
        ret.mod.rangeCheck = value => value !== 0n;

        return ret;
    })());

    const outputPower = document.getElementById('output-power');

    const parse = function (paramData) {
        value = tryValidateBigInt(paramData.input.value,
                                  paramData.rangeCheck);

        paramData.value = value;
        paramData.show();
        return value !== undefined;
    };

    const computePower = function (base, exponent, mod) {
        return pyodide.runPython(`pow(${base}, ${exponent}, ${mod})`);
    };

    const update = function () {
        let ok = true;

        Object.values(params).forEach(paramData => {
            // Don't short-circuit: update all, even if some are ill-formed.
            ok = parse(paramData) && ok;
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

    Object.values(params).forEach(paramData =>
        paramData.input.addEventListener('input', update));
})();
