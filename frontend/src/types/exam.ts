export interface TeacherFeedback {
  is_correct: boolean | null;
  score: string;
  symbols: string[];
  comment: string;
}

export interface StudentMarks {
  checked_options: string[];
  crossed: boolean;
  other_marks: string;
}

export interface StudentAnswer {
  final?: string;
  steps?: string[];
}

export interface Question {
  id: string;
  type: string;
  stem: string;
  options?: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  student_answer?: any;
  student_marks?: StudentMarks;
  teacher_feedback?: TeacherFeedback;
  sub_questions?: Question[];
}

export interface ExamPaper {
  paper_title: string;
  subject: string;
  questions: Question[];
}
