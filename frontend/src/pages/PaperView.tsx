/* eslint-disable @typescript-eslint/no-explicit-any */
import { message, Layout } from 'antd';
import { useRef, useState, useCallback, useMemo } from 'react';
import { extractExam } from '../services/api';
import PaperHero from '../components/PaperHero';
import UploadPanel from '../components/UploadPanel';
import PaperSummary from '../components/PaperSummary';
import QuestionStack from '../components/QuestionStack';
import PlaceholderGuide from '../components/PlaceholderGuide';
import FloatQuestionNav from '../components/FloatQuestionNav';
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

const normalizeSubjectValue = (value: string | undefined) => {
  if (!value) return 'math';
  const normalized = value.toLowerCase();
  if (normalized === 'math' || value === '数学') return 'math';
  if (normalized === 'english' || value === '英语') return 'english';
  return 'math';
};

const sampleImages = [
  { name: 'math1.jpg', src: '/samples/math1.jpg' },
  { name: 'math2.jpg', src: '/samples/math2.jpg' },
  { name: 'math3.jpg', src: '/samples/math3.jpg' },
  { name: 'english1.png', src: '/samples/english1.png' },
  { name: 'english2.png', src: '/samples/english2.png' },
  { name: 'english3.png', src: '/samples/english3.png' },
];

export default function PaperView() {
  const uploadRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [subject, setSubject] = useState('auto');
  const [loading, setLoading] = useState(false);

  const handleUpload = useCallback((file: File) => {
    setFile(file);
    return false; // 阻止自动上传
  }, []);

  const handleSampleSelect = useCallback(async (name: string, src: string) => {
    try {
      const res = await fetch(src);
      if (!res.ok) {
        throw new Error('sample not found');
      }
      const blob = await res.blob();
      const sampleFile = new File([blob], name, { type: blob.type });
      setFile(sampleFile);
      message.success(`已选择示例：${name}`);
    } catch {
      message.error('示例图片加载失败，请检查路径');
    }
  }, []);

  const onParse = useCallback(async () => {
    if (!file) {
      message.warning('请选择试卷图片');
      return;
    }
    setLoading(true);
    const res = await extractExam(file, 'auto');
    setSubject('auto');
    const normalizedSubject = normalizeSubjectValue(
      res.subject || (res.result as ExamPaper | undefined)?.subject
    );
    const nextPaper = res.result as ExamPaper;
    setPaper({ ...nextPaper, subject: normalizedSubject });
    setLoading(false);
  }, [file]);

  const questionCount = paper?.questions?.length ?? 0;
  const subjectLabel = useMemo(
    () => getSubjectLabel(paper?.subject || subject),
    [paper?.subject, subject]
  );
  const normalizedPaperSubject = useMemo(
    () => normalizeSubjectValue(paper?.subject || subject),
    [paper?.subject, subject]
  );
  const isEnglish = normalizedPaperSubject === 'english';
  const selectedSampleName = file?.name ?? '';

  const handleJump = useCallback((id: string) => {
    const target = document.getElementById(`question-${id}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleStartUpload = useCallback(() => {
    const target = document.getElementById('upload-panel');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    window.setTimeout(() => {
      const input =
        uploadRef.current?.querySelector<HTMLInputElement>('input[type="file"]');
      input?.click();
    }, 150);
  }, []);

  const uploadFileLabel = file ? `已选择：${file.name}` : '还未选择文件';

  return (
    <Layout className="app-shell">
      <Layout.Content className="app-content">
        <div className="hero">
          <PaperHero />
          <UploadPanel
            subject={subject}
            subjectOptions={subjectOptions}
            loading={loading}
            fileName={uploadFileLabel}
            onUpload={handleUpload}
            onParse={onParse}
            onSubjectChange={setSubject}
            sampleImages={sampleImages}
            selectedSampleName={selectedSampleName}
            onSampleSelect={handleSampleSelect}
            uploadActionsRef={uploadRef}
          />
        </div>

        {paper ? (
          <>
            <PaperSummary
              title={paper.paper_title || '数学试卷'}
              subjectLabel={subjectLabel}
              questionCount={questionCount}
              modeLabel={getSubjectLabel(subject)}
            />
            <QuestionStack
              questions={paper.questions}
              subject={paper.subject}
              isEnglish={isEnglish}
            />
          </>
        ) : (
          <PlaceholderGuide onStartUpload={handleStartUpload} />
        )}
      </Layout.Content>
      {paper && <FloatQuestionNav questions={paper.questions} onJump={handleJump} />}
    </Layout>
  );
}
