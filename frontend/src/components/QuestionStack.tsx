import { memo } from 'react';
import type { Question } from '../types/exam';
import QuestionCard from './QuestionCard';
import EnglishQuestionCard from './EnglishQuestionCard';

interface Props {
  questions: Question[];
  subject: string;
  isEnglish: boolean;
}

function QuestionStack({ questions, subject, isEnglish }: Props) {
  return (
    <div className="question-stack">
      {questions.map(q =>
        isEnglish ? (
          <EnglishQuestionCard key={q.id} question={q} subject={subject} />
        ) : (
          <QuestionCard key={q.id} question={q} subject={subject} />
        )
      )}
    </div>
  );
}

export default memo(QuestionStack);
