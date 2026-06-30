"use client";

interface Props {
  questions: string[];
  onSelect: (question: string) => void;
}

export default function FollowUpQuestions({ questions, onSelect }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">더 듣고 싶다면</p>
      {questions.map((q, i) => (
        <button
          key={i}
          onClick={() => onSelect(q)}
          className="w-full text-left px-4 py-3 bg-white rounded-2xl border border-gray-100 text-sm text-gray-700 hover:border-gray-300 active:scale-[0.98] transition-all flex items-center justify-between gap-2"
        >
          <span>{q}</span>
          <span className="text-gray-400 flex-shrink-0">→</span>
        </button>
      ))}
    </div>
  );
}
