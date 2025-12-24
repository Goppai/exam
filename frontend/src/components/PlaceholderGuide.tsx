import { memo } from 'react';
import { Card, Button } from 'antd';
import { UploadOutlined, FileSearchOutlined, BulbOutlined } from '@ant-design/icons';

interface Props {
  onStartUpload: () => void;
}

function PlaceholderGuide({ onStartUpload }: Props) {
  return (
    <div className="placeholder-stack">
      <Card className="guide-card">
        <div className="guide-title">三步开始学习</div>
        <div className="guide-steps">
          <div className="guide-step">
            <span className="guide-icon">
              <UploadOutlined />
            </span>
            <div>
              <strong>上传试卷</strong>
              <div>选择图片或使用示例</div>
            </div>
          </div>
          <div className="guide-step">
            <span className="guide-icon">
              <FileSearchOutlined />
            </span>
            <div>
              <strong>自动拆题</strong>
              <div>识别题型与学生作答</div>
            </div>
          </div>
          <div className="guide-step">
            <span className="guide-icon">
              <BulbOutlined />
            </span>
            <div>
              <strong>一键讲解</strong>
              <div>对照解析快速复盘</div>
            </div>
          </div>
        </div>
        <Button type="primary" className="guide-button" onClick={onStartUpload}>
          开始上传
        </Button>
      </Card>
      {[1, 2].map(item => (
        <Card key={item} className="question-card placeholder-card">
          <div className="thumbnail-header">
            <div className="thumbnail-index" />
            <div className="thumbnail-lines">
              <div className="thumbnail-line long" />
              <div className="thumbnail-line short" />
            </div>
          </div>
          <div className="thumbnail-block" />
          <div className="thumbnail-options">
            <div className="thumbnail-option" />
            <div className="thumbnail-option" />
            <div className="thumbnail-option half" />
          </div>
          <div className="thumbnail-answer">
            <div className="thumbnail-line medium" />
            <div className="thumbnail-line short" />
          </div>
          <div className="placeholder-tags">
            <span className="placeholder-pill" />
            <span className="placeholder-pill" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default memo(PlaceholderGuide);
