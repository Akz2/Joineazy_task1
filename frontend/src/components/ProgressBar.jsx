export default function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-4">
      <div
        className="bg-green-500 h-4 rounded-full transition-all duration-500"
        style={{ width: `${percent}%` }}
      />
      <p className="text-sm mt-1 text-gray-600">{percent}% complete</p>
    </div>
  );
}
