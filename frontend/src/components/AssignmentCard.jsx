import SubmissionConfirm from './SubmissionConfirm';

export default function AssignmentCard({ assignment, groupId, onConfirmed }) {
  return (
    <div className="border rounded p-4 bg-white shadow-sm space-y-2">
      <h3 className="font-semibold text-lg">{assignment.title}</h3>
      <p className="text-gray-600 text-sm">{assignment.description}</p>
      <p className="text-sm text-gray-500">
        Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleString() : 'N/A'}
      </p>
      {assignment.onedrive_link && (
        <a
          href={assignment.onedrive_link}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 underline text-sm"
        >
          Open OneDrive Submission Link
        </a>
      )}
      {groupId && (
        <div className="pt-2">
          <SubmissionConfirm assignmentId={assignment.id} groupId={groupId} onConfirmed={onConfirmed} />
        </div>
      )}
    </div>
  );
}
