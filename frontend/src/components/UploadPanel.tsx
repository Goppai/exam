import { memo, type RefObject } from 'react';
import { Upload, Button, Select, Typography, Card, Space, Tag, Divider } from 'antd';
import type { UploadProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface SampleImage {
  name: string;
  src: string;
}

interface Props {
  subject: string;
  subjectOptions: { value: string; label: string }[];
  loading: boolean;
  fileName: string;
  onUpload: UploadProps['beforeUpload'];
  onParse: () => void;
  onSubjectChange: (value: string) => void;
  sampleImages: SampleImage[];
  selectedSampleName: string;
  onSampleSelect: (name: string, src: string) => void;
  uploadActionsRef: RefObject<HTMLDivElement | null>;
}

function UploadPanel({
  subject,
  subjectOptions,
  loading,
  fileName,
  onUpload,
  onParse,
  onSubjectChange,
  sampleImages,
  selectedSampleName,
  onSampleSelect,
  uploadActionsRef,
}: Props) {
  return (
    <Card className="upload-card" id="upload-panel">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Typography.Title level={4} className="upload-title">
            上传试卷图片
          </Typography.Title>
          <Typography.Text className="upload-hint">
            支持 JPG/PNG，建议清晰拍照或扫描件。
          </Typography.Text>
        </div>
        <div className="upload-actions" ref={uploadActionsRef}>
          <Upload beforeUpload={onUpload} showUploadList={false}>
            <Button icon={<UploadOutlined />}>选择试卷图片</Button>
          </Upload>
          <Select
            value={subject}
            onChange={onSubjectChange}
            style={{ width: 120 }}
            options={subjectOptions}
            disabled
          />
          <Button
            type="primary"
            onClick={onParse}
            loading={loading}
            className="explain-button"
          >
            解析试卷
          </Button>
        </div>
        <div className="upload-file">{fileName}</div>
        <Divider style={{ margin: '6px 0' }} />
        <Space size={8} wrap>
          <Tag color="geekblue">数学优先</Tag>
          <Tag color="cyan">结构化输出</Tag>
          <Tag color="gold">讲解卡片</Tag>
        </Space>
        <Divider style={{ margin: '12px 0' }} />
        <div className="sample-title">示例试卷（点击快速选择）</div>
        <div className="sample-grid">
          {sampleImages.map(sample => (
            <button
              key={sample.name}
              type="button"
              className={`sample-item${
                selectedSampleName === sample.name ? ' sample-item--active' : ''
              }`}
              onClick={() => onSampleSelect(sample.name, sample.src)}
            >
              <img src={sample.src} alt={sample.name} loading="lazy" />
              <span>{sample.name}</span>
            </button>
          ))}
        </div>
      </Space>
    </Card>
  );
}

export default memo(UploadPanel);
