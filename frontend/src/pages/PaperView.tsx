/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Upload,
  Button,
  Select,
  message,
  Layout,
  Typography,
  Card,
  Space,
  Tag,
  Divider,
} from 'antd';
import {
  UploadOutlined,
  ReadOutlined,
  FileSearchOutlined,
  BulbOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { extractExam } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import type { ExamPaper } from '../types/exam';

const subjectOptions = [
  { value: 'auto', label: '自动' },
  { value: 'math', label: '数学' },
  { value: 'english', label: '英语' },
];

const getSubjectLabel = (value: string) => {
  if (!value) return '数学';
  const normalized = value.toLowerCase();
  if (normalized === 'math' || value === '数学') return '数学';
  if (normalized === 'english' || value === '英语') return '英语';
  if (normalized === 'auto') return '自动';
  return value;
};

export default function PaperView() {
  const [file, setFile] = useState<File | null>(null);
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [subject, setSubject] = useState('auto');
  const [loading, setLoading] = useState(false);

  const handleUpload = (file: File) => {
    setFile(file);
    return false; // 阻止自动上传
  };

  const onParse = async () => {
    if (!file) {
      message.warning('请选择试卷图片');
      return;
    }
    setLoading(true);
    const res = await extractExam(file, subject);
    setSubject(res.subject);
    setPaper(res.result as ExamPaper);
    setLoading(false);
  };

  const questionCount = paper?.questions?.length ?? 0;
  const subjectLabel = getSubjectLabel(paper?.subject || subject);

  return (
    <Layout className="app-shell">
      <Layout.Content className="app-content">
        <div className="hero">
          <div>
            <div className="brand-badge">
              <ReadOutlined />
              数学讲解工坊
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
          </div>
          <Card className="upload-card">
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Typography.Title level={4} className="upload-title">
                  上传试卷图片
                </Typography.Title>
                <Typography.Text className="upload-hint">
                  支持 JPG/PNG，建议清晰拍照或扫描件。
                </Typography.Text>
              </div>
              <div className="upload-actions">
                <Upload beforeUpload={handleUpload} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>选择试卷图片</Button>
                </Upload>
                <Select
                  value={subject}
                  onChange={setSubject}
                  style={{ width: 120 }}
                  options={subjectOptions}
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
              <div className="upload-file">
                {file ? `已选择：${file.name}` : '还未选择文件'}
              </div>
              <Divider style={{ margin: '6px 0' }} />
              <Space size={8} wrap>
                <Tag color="geekblue">数学优先</Tag>
                <Tag color="cyan">结构化输出</Tag>
                <Tag color="gold">讲解卡片</Tag>
              </Space>
            </Space>
          </Card>
        </div>

        {paper && (
          <>
            <Card className="paper-summary">
              <div className="paper-summary__content">
                <div>
                  <Typography.Text type="secondary">试卷标题</Typography.Text>
                  <Typography.Title level={3} className="paper-title">
                    {paper.paper_title || '数学试卷'}
                  </Typography.Title>
                  <div className="paper-meta">
                    <Tag className="subject-tag">{subjectLabel}</Tag>
                    <span>题量 {questionCount} 题</span>
                    <span>当前模式 {getSubjectLabel(subject)}</span>
                  </div>
                </div>
                <div className="paper-stats">
                  <div className="paper-stat">已拆解 {questionCount} 道题</div>
                  <div className="paper-stat">点击卡片右上角获取讲解</div>
                </div>
              </div>
            </Card>
            <div className="question-stack">
              {paper.questions.map(q => (
                <QuestionCard key={q.id} question={q} subject={paper.subject} />
              ))}
            </div>
          </>
        )}
      </Layout.Content>
    </Layout>
  );
}
