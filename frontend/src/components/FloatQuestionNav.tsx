import { memo } from 'react';
import { FloatButton } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
import type { Question } from '../types/exam';

interface Props {
  questions: Question[];
  onJump: (id: string) => void;
}

function FloatQuestionNav({ questions, onJump }: Props) {
  if (questions.length === 0) return null;

  return (
    <FloatButton.Group
      open
      shape="square"
      type="primary"
      icon={<UnorderedListOutlined />}
      className="jump-float"
      tooltip="题号导航"
    >
      {questions.map(q => (
        <FloatButton
          key={q.id}
          type="primary"
          shape="square"
          tooltip={`第 ${q.id} 题`}
          content={<span className="float-number">{q.id}</span>}
          aria-label={`跳转到第 ${q.id} 题`}
          onClick={() => onJump(q.id)}
        />
      ))}
    </FloatButton.Group>
  );
}

export default memo(FloatQuestionNav);
