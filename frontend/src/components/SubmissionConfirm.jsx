import { useState } from 'react';
import api from '../api/axios';

export default function SubmissionConfirm({ assignmentId, groupId, onConfirmed }) {
  const [step, setStep] = useState(0);

  const confirm = async () => {
    await api.post('/submissions/confirm', { assignment_id: assignmentId, group_id: groupId });
    setStep(2);
    onConfirmed && onConfirmed();
  };

  if (step === 2) return <span className="text-green-600 font-medium">Submitted ✓</span>;

  if (step === 1) {
    return (
      <div className="flex gap-2">
        <button onClick={confirm} className="bg-green-600 text-white px-3 py-1 rounded">
          Confirm
        </button>
        <button onClick={() => setStep(0)} className="bg-gray-300 px-3 py-1 rounded">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-3 py-1 rounded">
      Yes, I have submitted
    </button>
  );
}
