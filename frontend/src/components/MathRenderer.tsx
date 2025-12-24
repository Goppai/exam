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

    // 去掉多余换行
    s = s.replace(/\n+/g, ' ');

    // 合并多空格
    s = s.replace(/\s{2,}/g, ' ');

    return s;
  };

  const fixed = normalize(raw);

  /** ② 判断是否“像数学表达式” */
  const isMath = (s: string) => {
    return /\\[a-zA-Z]+|\^|=|×|÷|\*|\/|\d/.test(s);
  };

  /** ③ 混排切分 */
  const splitMixed = (input: string): string[] => {
    const result: string[] = [];
    let buf = '';
    let inMath = false;

    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      const mathChar = /[\\\d^_=×÷*/(){}.+-]/.test(ch);

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

  const parts = splitMixed(fixed);

  return (
    <>
      {parts.map((part, idx) => {
        if (isMath(part)) {
          try {
            return <InlineMath key={idx} math={part} />;
          } catch {
            return <span key={idx}>{part}</span>;
          }
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}
