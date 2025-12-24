import { memo } from 'react';
import { Typography } from 'antd';
import {
  ReadOutlined,
  FileSearchOutlined,
  BulbOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';

function PaperHero() {
  return (
    <div>
      <div className="brand-badge">
        <ReadOutlined />
        试卷讲解工坊
      </div>
      <Typography.Title className="hero-title">
        把试卷拆成可学习的卡片
      </Typography.Title>
      <Typography.Paragraph className="hero-subtitle">
        上传试卷图片，自动识别题目、整理答案，并生成讲解与批改信息，
        让每道题都变成可追踪的学习记录。
      </Typography.Paragraph>
      <div className="feature-list">
        <div className="feature-item">
          <FileSearchOutlined />
          <div>
            <strong>题目切分</strong>
            <div>按题号输出结构化信息，支持填空与解答题。</div>
          </div>
        </div>
        <div className="feature-item">
          <ThunderboltOutlined />
          <div>
            <strong>自动批改</strong>
            <div>识别学生作答，标注正确率与得分。</div>
          </div>
        </div>
        <div className="feature-item">
          <BulbOutlined />
          <div>
            <strong>即时讲解</strong>
            <div>一键生成解析，形成可复习的知识卡片。</div>
          </div>
        </div>
      </div>
      <div className="tips-card">
        <div className="tips-title">小贴士</div>
        <ul className="tips-list">
          <li>
            <strong>分数乘法：</strong>先约分再相乘，分子分母能约尽量先约。
          </li>
          <li>
            <strong>分数加减：</strong>先通分再相加减，注意化简。
          </li>
          <li>
            <strong>冠词口诀：</strong>元音音素用 an，辅音音素用 a；特指用 the。
          </li>
          <li>
            <strong>阅读理解：</strong>先看题干抓关键词，再回原文定位。
          </li>
        </ul>
      </div>
    </div>
  );
}

export default memo(PaperHero);
