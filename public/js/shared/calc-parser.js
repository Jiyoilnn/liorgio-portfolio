/**
 * calc-parser.js — a safe maths expression evaluator (no eval, no Function).
 *
 * WHY? The old calculator used  Function('return ' + input)()  which RUNS whatever you type
 * as JavaScript. A character whitelist helps, but writing a real parser is the proper fix
 * AND a classic computer-science exercise.
 *
 * TECHNIQUE: "recursive descent". The grammar is written as one function per rule, each
 * calling the rule with the next-higher precedence:
 *
 *   expression := term   (('+' | '-') term)*
 *   term       := unary  (('*' | '/' | 'mod' | implicit) unary)*
 *   unary      := ('-' | '+') unary | power
 *   power      := postfix ('^' unary)?          <- right-associative:  2^3^2 = 2^(3^2)
 *   postfix    := primary '%'*                  <- 50% = 0.5
 *   primary    := number | constant | function '(' expression ')' | '(' expression ')'
 *
 * Because `term` is called from `expression`, multiplication automatically binds tighter
 * than addition. Precedence is encoded in the call structure itself.
 */

export class CalcError extends Error {}

const FUNCTIONS = {
  sqrt: Math.sqrt, abs: Math.abs, ln: Math.log, log: Math.log10, exp: Math.exp, round: Math.round,
  floor: Math.floor, ceil: Math.ceil,
  sin: (x) => Math.sin(x), cos: (x) => Math.cos(x), tan: (x) => Math.tan(x), // radians
  sind: (x) => Math.sin((x * Math.PI) / 180), cosd: (x) => Math.cos((x * Math.PI) / 180), tand: (x) => Math.tan((x * Math.PI) / 180), // degrees
};
const CONSTANTS = { pi: Math.PI, e: Math.E };

/** Break text into tokens: numbers, words, operators, parentheses. */
export function tokenize(input) {
  const text = input.replace(/×/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/π/g, 'pi').replace(/√/g, 'sqrt');
  const tokens = [];
  const re = /\s*(?:(\d+\.?\d*|\.\d+)|([a-z]+)|(.))/giy;
  let m;
  while (re.lastIndex < text.length && (m = re.exec(text))) {
    if (m[1] !== undefined) tokens.push({ type: 'num', value: parseFloat(m[1]) });
    else if (m[2] !== undefined) tokens.push({ type: 'word', value: m[2].toLowerCase() });
    else if ('+-*/^%()'.includes(m[3])) tokens.push({ type: 'op', value: m[3] });
    else if (m[3].trim()) throw new CalcError(`Unexpected character "${m[3]}"`);
  }
  return tokens;
}

/**
 * Evaluate an expression string.
 * @param {string} input
 * @param {{ans?: number}} [ctx]  `ans` is the previous result
 * @returns {{ok:true, value:number} | {ok:false, error:string}}
 */
export function evaluate(input, ctx = {}) {
  try {
    if (!input.trim()) throw new CalcError('Type a calculation first.');
    const tokens = tokenize(input);
    let pos = 0;

    const peek = () => tokens[pos];
    const isOp = (v) => peek()?.type === 'op' && peek().value === v;
    const isWord = (v) => peek()?.type === 'word' && peek().value === v;

    function expression() {
      let left = term();
      while (isOp('+') || isOp('-')) left = tokens[pos++].value === '+' ? left + term() : left - term();
      return left;
    }

    function term() {
      let left = unary();
      for (;;) {
        if (isOp('*')) { pos++; left *= unary(); }
        else if (isOp('/')) { pos++; const r = unary(); if (r === 0) throw new CalcError('Cannot divide by zero.'); left /= r; }
        else if (isWord('mod')) { pos++; const r = unary(); if (r === 0) throw new CalcError('Cannot divide by zero.'); left %= r; }
        // implicit multiplication:  2(3+4)  or  2pi
        else if (isOp('(') || (peek()?.type === 'word' && !isWord('mod'))) left *= unary();
        else return left;
      }
    }

    function unary() {
      if (isOp('-')) { pos++; return -unary(); }
      if (isOp('+')) { pos++; return unary(); }
      return power();
    }

    function power() {
      const base = postfix();
      if (isOp('^')) { pos++; return base ** unary(); }
      return base;
    }

    function postfix() {
      let v = primary();
      while (isOp('%')) { pos++; v /= 100; }
      return v;
    }

    function primary() {
      const t = tokens[pos++];
      if (!t) throw new CalcError('The expression ends too early.');
      if (t.type === 'num') return t.value;
      if (t.type === 'op' && t.value === '(') {
        const v = expression();
        if (!isOp(')')) throw new CalcError('Missing closing parenthesis.');
        pos++;
        return v;
      }
      if (t.type === 'word') {
        if (t.value === 'ans') return ctx.ans ?? 0;
        if (t.value in CONSTANTS) return CONSTANTS[t.value];
        if (t.value in FUNCTIONS) {
          if (!isOp('(')) throw new CalcError(`${t.value} needs parentheses, e.g. ${t.value}(9).`);
          pos++;
          const arg = expression();
          if (!isOp(')')) throw new CalcError('Missing closing parenthesis.');
          pos++;
          if (t.value === 'sqrt' && arg < 0) throw new CalcError('Square root of a negative number.');
          if ((t.value === 'ln' || t.value === 'log') && arg <= 0) throw new CalcError('Logarithm needs a positive number.');
          return FUNCTIONS[t.value](arg);
        }
        throw new CalcError(`Unknown word "${t.value}".`);
      }
      throw new CalcError(`Unexpected "${t.value}".`);
    }

    const value = expression();
    if (pos < tokens.length) throw new CalcError(`Unexpected "${tokens[pos].value}".`);
    if (!Number.isFinite(value)) throw new CalcError('The result is too large or undefined.');
    // toPrecision hides floating-point noise: 0.1 + 0.2 -> 0.3 instead of 0.30000000000000004
    return { ok: true, value: Number(value.toPrecision(12)) };
  } catch (err) {
    if (err instanceof CalcError) return { ok: false, error: err.message };
    throw err; // a real bug: don't hide it
  }
}
