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

    const pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/',
    });

    const params = Object.freeze((function () {
        const ret = {};

        ['base', 'exponent', 'mod'].forEach(param => {
            ret[param] = {
                input: document.getElementById(`input-${param}`),
                output: document.getElementById(`output-${param}`),
                value: undefined,
                rangeCheck: _value => true, // Default is no range check.
                format: String,
            };
        });

        ret.base.format = value =>
            (value < 0 ? `(${TEXT.MINUS}${-value})` : String(value));

        ret.exponent.rangeCheck = value => value >= 0n;
        ret.mod.rangeCheck = value => value !== 0n;

        return ret;
    })());

    const outputPower = document.getElementById('output-power');

    const parse = function (paramData) {
        value = tryValidateBigInt(paramData.input.value,
                                  paramData.rangeCheck);

        paramData.value = value;

        if (value === undefined) {
            paramData.output.innerText = TEXT.NO_VALUE;
            return false;
        }

        paramData.output.innerText = paramData.format(value);
        return true;
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
