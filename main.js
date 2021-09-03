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

    const parse = function (input) {
        const text = input.value.trim();
        if (text.length === 0) {
            throw new SyntaxError('refusing to parse empty string as zero');
        }
        return BigInt(text);
    };

    const update = function () {
        try {
            const base = parse(inputBase);
            const exponent = parse(inputExponent);
            const mod = parse(inputMod);
            const power =
                pyodide.runPython(`pow(${base}, ${exponent}, ${mod})`);
            //console.log(`base=${base}, exponent=${exponent}, mod=${mod}`)

            resultBase.innerText = String(base);
            resultExponent.innerText = String(exponent);
            resultMod.innerText = String(mod);
            result.innerText = String(power);
        } catch (SyntaxError) {
            resultBase.innerText = NO_VALUE;
            resultExponent.innerText = NO_VALUE;
            resultMod.innerText = NO_VALUE;
            result.innerText = NO_VALUE;
        }
    };

    inputBase.addEventListener('input', update);
    inputExponent.addEventListener('input', update);
    inputMod.addEventListener('input', update);
})();
