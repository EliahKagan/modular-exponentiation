(async function () {
    const NO_VALUE = '???';

    const pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.18.0/full/'
    });
    window.pyodide = pyodide;

    pyodide.runPython(await (await fetch('hello.py')).text());

    const inputBase = document.getElementById('base');
    const inputExponent = document.getElementById('exponent');
    const inputMod = document.getElementById('mod');
    const resultBase = document.getElementById('result-base');
    const resultExponent = document.getElementById('result-exponent');
    const resultMod = document.getElementById('result-mod');
    const result = document.getElementById('result');

    const parse = function (input, rangeCheck = (value) => true) {
        const text = input.value.trim();
        if (text.length === 0) {
            throw new SyntaxError('refusing to parse empty string as zero');
        }

        const value = BigInt(text);
        if (!rangeCheck(value)) {
            throw new RangeError('an argument is out of range');
        }

        return value;
    };

    const clearResults = function () {
        resultBase.innerText = NO_VALUE;
        resultExponent.innerText = NO_VALUE;
        resultMod.innerText = NO_VALUE;
        result.innerText = NO_VALUE;
    };

    const setResults = function (base, exponent, mod, power) {
        resultBase.innerText = String(base);
        resultExponent.innerText = String(exponent);
        resultMod.innerText = String(mod);
        result.innerText = String(power);
    };

    const update = function () {
        try {
            const base = parse(inputBase);
            const exponent = parse(inputExponent, value => value >= 0n);
            const mod = parse(inputMod, value => value !== 0n);

            const expression = `pow(${base}, ${exponent}, ${mod})`;
            const power = pyodide.runPython(expression);

            setResults(base, exponent, mod, power);
        } catch (error) {
            if (error instanceof SyntaxError || error instanceof RangeError) {
                clearResults();
            } else {
                throw error;
            }
        }
    };

    inputBase.addEventListener('input', update);
    inputExponent.addEventListener('input', update);
    inputMod.addEventListener('input', update);
})();
