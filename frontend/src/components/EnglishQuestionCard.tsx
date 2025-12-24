import { Card, Button, Tag, Typography, Space } from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useState } from 'react';
import type { Question } from '../types/exam';
import { explainQuestion } from '../services/api';

interface Props {
  question: Question;
  subject: string;
}

export default function EnglishQuestionCard({ question, subject }: Props) {
  const [loading, setLoading] = useState(false);
  const [explain, setExplain] = useState<string>('');
  const { Text, Paragraph } = Typography;
  const normalizedSubject = subject?.toLowerCase();
  const apiSubject =
    normalizedSubject === 'english' || subject === '英语' ? 'english' : 'math';

  const onExplain = async () => {
    setLoading(true);
    try {
      const res = await explainQuestion(apiSubject, question);
      setExplain(res.explanation || '');
    } finally {
      setLoading(false);
    }
  };

  const optionEntries = question.options
    ? Object.entries(question.options)
    : [];
  const explainLabel = explain ? '重新讲解' : '讲解';

  const studentMarks = question.student_marks;
  const finalAnswer =
    typeof question.student_answer === 'string'
      ? question.student_answer
      : question.student_answer?.final;
  const checkedOptions =
    studentMarks?.checked_options && studentMarks.checked_options.length > 0
      ? studentMarks.checked_options
      : finalAnswer
        ? [finalAnswer]
        : [];

  const explainLines = explain.split('\n').filter(line => line.trim() !== '');
  const sectionTitles = ['正确答案', '逐句翻译', '关键词汇', '讲解说明', '错误分析'];
  const isSectionTitle = (line: string) =>
    sectionTitles.some(title =>
      line.replace(/\*\*/g, '').trim().startsWith(`${title}：`)
    );
  const getSectionName = (line: string) => {
    const normalized = line.replace(/\*\*/g, '').trim();
    const hit = sectionTitles.find(title =>
      normalized.startsWith(`${title}：`)
    );
    return hit ?? null;
  };

  const highlightInline = (line: string) => {
    const segments: React.ReactNode[] = [];
    const parts = line.split('`');
    parts.forEach((part, idx) => {
      if (idx % 2 === 1) {
        segments.push(
          <span key={`code-${idx}`} className="explain-highlight">
            {part}
          </span>
        );
        return;
      }
      const regex = /(["“”‘’])([^"“”‘’]+)(["“”‘’])/g;
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(part)) !== null) {
        const [full, left, word, right] = match;
        const start = match.index;
        if (start > lastIndex) {
          segments.push(part.slice(lastIndex, start));
        }
        segments.push(left);
        segments.push(
          <span key={`quote-${idx}-${start}`} className="explain-highlight">
            {word}
          </span>
        );
        segments.push(right);
        lastIndex = start + full.length;
      }
      if (lastIndex < part.length) {
        segments.push(part.slice(lastIndex));
      }
    });
    return segments;
  };

  const renderKeywordLine = (line: string) => {
    const match = line.match(/^(\s*[-•]?\s*)([^:：]+)([:：]\s*)(.*)$/);
    if (!match) return <span>{line}</span>;
    const [, prefix, word, sep, rest] = match;
    return (
      <span>
        {prefix}
        <span className="keyword-highlight">{word.trim()}</span>
        {sep}
        {highlightInline(rest)}
      </span>
    );
  };

  let activeSection: string | null = null;

  return (
    <Card
      className="question-card english-card"
      id={`question-${question.id}`}
      title={
        <div className="question-card__title">
          <div className="question-index">{question.id}</div>
          <div>
            <div className="question-title">Question {question.id}</div>
            <div className="question-subtitle">
              <Tag color="green" bordered={false}>
                英语
              </Tag>
              <Tag color="default" bordered={false}>
                {question.type || '题目'}
              </Tag>
            </div>
          </div>
        </div>
      }
      extra={
        <Button
          type="primary"
          icon={<BulbOutlined />}
          onClick={onExplain}
          loading={loading}
          className="english-explain-button"
        >
          {explainLabel}
        </Button>
      }
    >
      <div className="question-section">
        <div className="section-label">题干</div>
        <Paragraph className="section-body english-stem">
          {question.stem}
        </Paragraph>
      </div>

      {optionEntries.length > 0 && (
        <div className="question-section">
          <div className="section-label">选项</div>
          <ul className="option-list english-options">
            {optionEntries.map(([k, v]) => {
              const isSelected = checkedOptions.includes(k) || checkedOptions.includes(v);
              return (
                <li
                  key={k}
                  className={`option-item ${isSelected ? 'option-item--selected' : ''}`}
                >
                  <strong>{k}.</strong> {v}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {question.student_answer && (
        <div className="question-section">
          <div className="section-label">学生答案</div>
          {typeof question.student_answer === 'string' ? (
            <div className="section-body">{question.student_answer}</div>
          ) : (
            <div className="answer-block english-answer">
              {question.student_answer.final && (
                <div>
                  <Text type="secondary">最终答案</Text>
                  <div className="section-body">{question.student_answer.final}</div>
                </div>
              )}
              {Array.isArray(question.student_answer.steps) &&
                question.student_answer.steps.length > 0 && (
                  <div>
                    <Text type="secondary">答题过程</Text>
                    <ul className="answer-steps">
                      {question.student_answer.steps.map((s, i) => (
                        <li key={`${question.id}-step-${i}`} className="step-card">
                          {String(s)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {studentMarks && (
        <div className="question-section">
          <div className="section-label">作答标记</div>
          <Space size={6} wrap>
            {checkedOptions.length > 0 && (
              <Tag color="green">选中：{checkedOptions.join(', ')}</Tag>
            )}
            {studentMarks.crossed && <Tag color="red">已划掉</Tag>}
            {studentMarks.other_marks && (
              <Tag color="gold">{studentMarks.other_marks}</Tag>
            )}
          </Space>
        </div>
      )}

      {question.teacher_feedback && (
        <div className="question-section">
          <div className="section-label">批改</div>
          <Space size={6} wrap>
            {question.teacher_feedback.is_correct === true && (
              <Tag color="green">正确</Tag>
            )}
            {question.teacher_feedback.is_correct === false && (
              <Tag color="red">错误</Tag>
            )}
            {question.teacher_feedback.score && (
              <Tag color="blue">{question.teacher_feedback.score}</Tag>
            )}
            {question.teacher_feedback.comment && (
              <Text type="secondary">{question.teacher_feedback.comment}</Text>
            )}
          </Space>
        </div>
      )}

      {(loading || explain) && (
        <div className="explain-block english-explain">
          <div className="explain-title">讲解</div>
          {loading && <div>正在生成讲解...</div>}
          {!loading && (
            <div>
              {explainLines.map((line, idx) => {
                const sectionName = getSectionName(line);
                if (sectionName) {
                  activeSection = sectionName;
                  return (
                    <div
                      key={`${question.id}-explain-${idx}`}
                      className="explain-section-title"
                    >
                      {line}
                    </div>
                  );
                }

                const content =
                  activeSection === '关键词汇'
                    ? renderKeywordLine(line)
                    : highlightInline(line.replace(/\*\*/g, ''));

                return (
                  <div
                    key={`${question.id}-explain-${idx}`}
                    className="explain-line"
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
