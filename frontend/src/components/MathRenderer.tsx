import { InlineMath } from 'react-katex';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  text?: any; // 允许任意类型
}

export default function MathRenderer({ text }: Props) {
  if (text === null || text === undefined) return null;

  /** ✅ 强制转成字符串 */
  const raw = typeof text === 'string' ? text : String(text);

  /** ① 预处理：反转义 + 清洗 */
  const normalize = (input: string) => {
    let s = input;

    // 把 \\frac 这种双反斜杠变成 \frac
    s = s.replace(/\\\\/g, '\\');

    // 去掉多余换行/制表
    s = s.replace(/[\n\t]+/g, ' ');

    // 修正常见 OCR 结果：\frac 1 2 -> \frac{1}{2}
    s = s.replace(
      /\\frac(?!\s*{)\s*([0-9a-zA-Z]+)\s*([0-9a-zA-Z]+)/g,
      '\\frac{$1}{$2}'
    );

    // 合并多空格
    s = s.replace(/\s{2,}/g, ' ');

    return s;
  };

  const fixed = normalize(raw);

  /** ② 判断是否“像数学表达式” */
  const isMath = (s: string) => {
    return /\\[a-zA-Z]+|\^|=|×|÷|\*|\/|\d/.test(s);
  };

  /** ③ 混排切分：保留 \frac / \times 等 LaTeX 命令 */
  const splitMixed = (input: string): string[] => {
    const result: string[] = [];
    let buf = '';
    let inMath = false;

    const isMathSymbol = (ch: string) =>
      /[\\\d^_=×÷*/(){}.+-]/.test(ch);
    const isLetter = (ch: string) => /[a-zA-Z]/.test(ch);

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const mathChar = isMathSymbol(ch) || (inMath && isLetter(ch));

      if (mathChar) {
        if (!inMath && buf) {
          result.push(buf);
          buf = '';
        }
        inMath = true;
        buf += ch;
      } else {
        if (inMath && buf) {
          result.push(buf);
          buf = '';
        }
        inMath = false;
        buf += ch;
      }
    }

    if (buf) result.push(buf);
    return result;
  };

  const renderMixed = (value: string) => {
    const parts = splitMixed(value);
    return parts.map((part, idx) => {
      if (isMath(part)) {
        try {
          return <InlineMath key={idx} math={part} />;
        } catch {
          return <span key={idx}>{part}</span>;
        }
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const splitByDollar = (input: string) => {
    const chunks: { type: 'text' | 'math'; value: string }[] = [];
    let buf = '';
    let inMath = false;

    const isEscaped = (index: number) => {
      let count = 0;
      for (let i = index - 1; i >= 0 && input[i] === '\\'; i--) {
        count += 1;
      }
      return count % 2 === 1;
    };

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '$' && !isEscaped(i)) {
        const nextIsDollar = input[i + 1] === '$' && !isEscaped(i + 1);
        if (nextIsDollar) {
          i += 1;
        }
        if (buf) {
          chunks.push({ type: inMath ? 'math' : 'text', value: buf });
          buf = '';
        }
        inMath = !inMath;
        continue;
      }
      buf += ch;
    }

    if (buf) {
      chunks.push({ type: inMath ? 'math' : 'text', value: buf });
    }

    if (inMath) return null;
    return chunks;
  };

  const dollarChunks = fixed.includes('$') ? splitByDollar(fixed) : null;

  return (
    <>
      {dollarChunks
        ? dollarChunks.map((chunk, idx) => {
            if (chunk.type === 'math') {
              const math = chunk.value.trim();
              if (!math) return null;
              try {
                return <InlineMath key={idx} math={math} />;
              } catch {
                return <span key={idx}>{chunk.value}</span>;
              }
            }
            const textValue = chunk.value.replace(/\\\$/g, '$');
            return <span key={idx}>{renderMixed(textValue)}</span>;
          })
        : renderMixed(fixed)}
    </>
  );
}
