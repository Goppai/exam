/* eslint-disable @typescript-eslint/no-explicit-any */
import { Upload, Button, Select, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { extractExam } from '../services/api';
import QuestionCard from '../components/QuestionCard';
import type { ExamPaper } from '../types/exam';
import testJson from '../../../outputs/456_20251224_170720.json';

export default function PaperView() {
  const [file, setFile] = useState<File | null>(null);
  const [paper, setPaper] = useState<ExamPaper | null>(testJson);
  const [subject, setSubject] = useState('math');
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
    setPaper(res);
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <Upload beforeUpload={handleUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>选择试卷图片</Button>
      </Upload>

      <Select
        value={subject}
        onChange={setSubject}
        style={{ width: 120, marginLeft: 8 }}
        options={[
          { value: 'auto', label: '自动' },
          { value: 'math', label: '数学' },
          { value: 'english', label: '英语' },
        ]}
      />

      <Button
        type="primary"
        onClick={onParse}
        loading={loading}
        style={{ marginLeft: 8 }}
      >
        解析试卷
      </Button>

      {paper && (
        <div style={{ marginTop: 24 }}>
          <h2>{paper.paper_title}</h2>
          {paper.questions.map(q => (
            <QuestionCard key={q.id} question={q} subject={paper.subject} />
          ))}
        </div>
      )}
    </div>
  );
}
