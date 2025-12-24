import { memo } from 'react';
import { Card, Typography, Tag } from 'antd';

interface Props {
  title: string;
  subjectLabel: string;
  questionCount: number;
  modeLabel: string;
}

function PaperSummary({ title, subjectLabel, questionCount, modeLabel }: Props) {
  return (
    <Card className="paper-summary">
      <div className="paper-summary__content">
        <div>
          <Typography.Text type="secondary">试卷标题</Typography.Text>
          <Typography.Title level={3} className="paper-title">
            {title}
          </Typography.Title>
          <div className="paper-meta">
            <Tag className="subject-tag">{subjectLabel}</Tag>
            <span>题量 {questionCount} 题</span>
            <span>当前模式 {modeLabel}</span>
          </div>
        </div>
        <div className="paper-stats">
          <div className="paper-stat">已拆解 {questionCount} 道题</div>
          <div className="paper-stat">点击卡片右上角获取讲解</div>
        </div>
      </div>
    </Card>
  );
}

export default memo(PaperSummary);
