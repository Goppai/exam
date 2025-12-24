import { Card, Button, Spin, Tag } from 'antd';
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

  return (
    <Card
      title={`第 ${question.id} 题（${question.type || '未知'}）`}
      style={{ marginBottom: 16 }}
      extra={
        <Button size="small" onClick={onExplain} loading={loading}>
          讲解
        </Button>
      }
    >
      {/* 题干 */}
      <div style={{ marginBottom: 8 }}>
        <MathRenderer text={question.stem} />
      </div>

      {/* 选项 */}
      {question.options && Object.keys(question.options).length > 0 && (
        <ul style={{ paddingLeft: 20 }}>
          {Object.entries(question.options).map(([k, v]) => (
            <li key={k} style={{ marginBottom: 4 }}>
              <b>{k}.</b> <MathRenderer text={v} />
            </li>
          ))}
        </ul>
      )}

      {/* 学生答案 */}
      {question.student_answer && (
        <div style={{ marginTop: 8 }}>
          <b>学生答案：</b>
          {typeof question.student_answer === 'string' ? (
            <span> {question.student_answer}</span>
          ) : (
            <>
              {question.student_answer.final && (
                <span>
                  {' '}
                  <MathRenderer text={question.student_answer.final} />
                </span>
              )}
              {question.student_answer.steps &&
                question.student_answer.steps.length > 0 && (
                  <ul style={{ marginTop: 4 }}>
                    {question.student_answer.steps.map(
                      (s: string, i: Key | null | undefined) => (
                        <li key={i}>
                          <MathRenderer text={s} />
                        </li>
                      )
                    )}
                  </ul>
                )}
            </>
          )}
        </div>
      )}

      {/* 批改信息 */}
      {feedback && (
        <div style={{ marginTop: 8 }}>
          <b>批改：</b>
          {isCorrect === true && <Tag color="green">√ 正确</Tag>}
          {isCorrect === false && <Tag color="red">× 错误</Tag>}
          {feedback.score && <Tag color="blue">{feedback.score} 分</Tag>}
          {feedback.comment && (
            <span style={{ marginLeft: 8 }}>{feedback.comment}</span>
          )}
        </div>
      )}

      {/* 讲解 */}
      {loading && (
        <div style={{ marginTop: 12 }}>
          <Spin />
        </div>
      )}

      {explain && !loading && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: '#fafafa',
            border: '1px solid #eee',
            borderRadius: 4,
            whiteSpace: 'pre-wrap',
          }}
        >
          <b>讲解：</b>
          <div style={{ marginTop: 6 }}>{explain}</div>
        </div>
      )}
    </Card>
  );
}
