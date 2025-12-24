import { Card, Button, Spin, Tag, Typography, Space } from 'antd';
import {
  BulbOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useState, type Key } from 'react';
import type { Question } from '../types/exam';
import { explainQuestion } from '../services/api';
import MathRenderer from './MathRenderer';

interface Props {
  question: Question;
  subject: string;
}

export default function QuestionCard({ question, subject }: Props) {
  const [loading, setLoading] = useState(false);
  const [explain, setExplain] = useState<string>('');

  const { Text } = Typography;

  const onExplain = async () => {
    setLoading(true);
    try {
      const res = await explainQuestion(subject, question);
      setExplain(res.explanation || '');
    } finally {
      setLoading(false);
    }
  };

  const feedback = question.teacher_feedback;
  const isCorrect = feedback?.is_correct;
  const explainLabel = explain ? '重新讲解' : '讲解';

  const normalizedSubject = subject?.toLowerCase();
  const subjectLabel =
    normalizedSubject === 'math' || subject === '数学'
      ? '数学'
      : normalizedSubject === 'english' || subject === '英语'
        ? '英语'
        : subject || '数学';

  const optionEntries = question.options
    ? Object.entries(question.options)
    : [];

  const scoreText =
    feedback?.score !== undefined && feedback?.score !== ''
      ? feedback.score
      : '';

  const statusTag =
    isCorrect === true ? (
      <Tag
        color="green"
        icon={<CheckCircleFilled />}
        className="status-tag"
      >
        正确
      </Tag>
    ) : isCorrect === false ? (
      <Tag color="red" icon={<CloseCircleFilled />} className="status-tag">
        错误
      </Tag>
    ) : (
      <Tag icon={<ClockCircleOutlined />} className="status-tag">
        待批改
      </Tag>
    );

  const getStepText = (value: unknown): string | null => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    if (value && typeof value === 'object') {
      const payload = value as {
        expression?: string;
        step?: string;
        comment?: string;
      };
      if (payload.expression) return payload.expression;
      if (payload.step) return payload.step;
      if (payload.comment) return payload.comment;
    }
    return null;
  };

  const renderStep = (step: unknown, index: Key | null | undefined) => {
    if (typeof step === 'string' || typeof step === 'number') {
      return (
        <li key={index} className="step-card">
          <MathRenderer text={String(step)} />
        </li>
      );
    }

    if (!step || typeof step !== 'object') return null;

    const payload = step as {
      expression?: string;
      result?: string;
      steps?: unknown[];
      comment?: string;
      step?: string;
      marks?: string;
    };
    const nestedSteps = Array.isArray(payload.steps) ? payload.steps : [];
    const stepText = getStepText(payload.step);
    const markText =
      typeof payload.marks === 'string' && payload.marks.trim()
        ? payload.marks.trim()
        : '';

    if (stepText) {
      const markColor = markText.includes('√')
        ? 'green'
        : markText.includes('×')
          ? 'red'
          : 'default';
      return (
        <li key={index} className="step-card">
          <div className="step-expression">
            <MathRenderer text={stepText} />
          </div>
          {markText && (
            <div className="step-meta">
              <Tag color={markColor}>{markText}</Tag>
            </div>
          )}
        </li>
      );
    }

    return (
      <li key={index} className="step-card">
        {payload.expression && (
          <div className="step-expression">
            <MathRenderer text={payload.expression} />
          </div>
        )}
        {payload.result && (
          <div className="step-meta">
            <Tag color="blue" bordered={false}>
              结果
            </Tag>
            <MathRenderer text={payload.result} />
          </div>
        )}
        {nestedSteps.length > 0 && (
          <ul className="step-sublist">
            {nestedSteps.map((item, nestedIndex) => (
              <li key={`${index}-${nestedIndex}`}>
                <MathRenderer text={getStepText(item) ?? String(item)} />
              </li>
            ))}
          </ul>
        )}
        {payload.comment && <div className="step-comment">{payload.comment}</div>}
      </li>
    );
  };

  const studentAnswer =
    question.student_answer &&
    typeof question.student_answer === 'object' &&
    question.student_answer !== null
      ? (question.student_answer as {
          final?: string;
          steps?: unknown[];
        })
      : null;
  const answerSteps = studentAnswer?.steps ?? [];

  return (
    <Card
      className="question-card"
      title={
        <div className="question-card__title">
          <div className="question-index">{question.id}</div>
          <div>
            <div className="question-title">第 {question.id} 题</div>
            <div className="question-subtitle">
              <Tag color="geekblue" bordered={false}>
                {subjectLabel}
              </Tag>
              <Tag color="default" bordered={false}>
                {question.type || '综合题'}
              </Tag>
            </div>
          </div>
        </div>
      }
      extra={
        <Space size={8} align="center">
          {statusTag}
          <Button
            type="primary"
            icon={<BulbOutlined />}
            onClick={onExplain}
            loading={loading}
            className="explain-button"
          >
            {explainLabel}
          </Button>
        </Space>
      }
    >
      <div className="question-section">
        <div className="section-label">题干</div>
        <div className="section-body">
          <MathRenderer text={question.stem} />
        </div>
      </div>

      {optionEntries.length > 0 && (
        <div className="question-section">
          <div className="section-label">选项</div>
          <ul className="option-list">
            {optionEntries.map(([k, v]) => (
              <li key={k}>
                <strong>{k}.</strong> <MathRenderer text={v} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {question.student_answer && (
        <div className="question-section">
          <div className="section-label">学生答案</div>
          {typeof question.student_answer === 'string' ? (
            <div className="section-body">
              <MathRenderer text={question.student_answer} />
            </div>
          ) : (
            <div className="answer-block">
              {studentAnswer?.final && (
                <div>
                  <Text type="secondary">最终答案</Text>
                  <div className="section-body">
                    <MathRenderer text={studentAnswer.final} />
                  </div>
                </div>
              )}
              {Array.isArray(answerSteps) && answerSteps.length > 0 && (
                <div>
                  <Text type="secondary">解题过程</Text>
                  <ul className="answer-steps">
                    {answerSteps.map(renderStep)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {feedback && (
        <div className="question-section">
          <div className="section-label">批改</div>
          <Space size={6} wrap>
            {statusTag}
            {scoreText && <Tag color="blue">{scoreText}</Tag>}
            {feedback.comment && (
              <Text type="secondary">{feedback.comment}</Text>
            )}
          </Space>
        </div>
      )}

      {loading && (
        <div className="explain-block">
          <Space>
            <Spin size="small" />
            <span>正在生成讲解...</span>
          </Space>
        </div>
      )}

      {explain && !loading && (
        <div className="explain-block">
          <div className="explain-title">讲解</div>
          <div>{explain}</div>
        </div>
      )}
    </Card>
  );
}
