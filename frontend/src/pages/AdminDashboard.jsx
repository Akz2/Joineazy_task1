import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', onedrive_link: '' });
  const [statusMap, setStatusMap] = useState({});

  const loadAssignments = async () => {
    const res = await api.get('/assignments');
    setAssignments(res.data.assignments);
  };

  useEffect(() => { loadAssignments(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const createAssignment = async (e) => {
    e.preventDefault();
    await api.post('/assignments', form);
    setForm({ title: '', description: '', due_date: '', onedrive_link: '' });
    loadAssignments();
  };

  const viewStatus = async (assignmentId) => {
    const res = await api.get(`/submissions/assignment/${assignmentId}/status`);
    setStatusMap((prev) => ({ ...prev, [assignmentId]: res.data.statuses }));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Professor Dashboard - {user?.name}</h1>
        <button onClick={logout} className="text-red-600 text-sm">Logout</button>
      </div>

      <form onSubmit={createAssignment} className="border rounded p-4 bg-white shadow-sm space-y-2">
        <h2 className="font-semibold">Create Assignment</h2>
        <input className="w-full border px-2 py-1 rounded" name="title" placeholder="Title" value={form.title} onChange={change} />
        <textarea className="w-full border px-2 py-1 rounded" name="description" placeholder="Description" value={form.description} onChange={change} />
        <input className="w-full border px-2 py-1 rounded" name="due_date" type="datetime-local" value={form.due_date} onChange={change} />
        <input className="w-full border px-2 py-1 rounded" name="onedrive_link" placeholder="OneDrive Link" value={form.onedrive_link} onChange={change} />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Post Assignment</button>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Assignments</h2>
        {assignments.map((a) => (
          <div key={a.id} className="border rounded p-4 bg-white shadow-sm space-y-2">
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-600">{a.description}</p>
            <button onClick={() => viewStatus(a.id)} className="text-blue-600 text-sm underline">
              View submission status
            </button>
            {statusMap[a.id] && (
              <ul className="text-sm mt-2 space-y-1">
                {statusMap[a.id].map((s) => (
                  <li key={s.group_id} className="flex justify-between">
                    <span>{s.group_name}</span>
                    <span className={s.status === 'confirmed' ? 'text-green-600' : 'text-gray-400'}>
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
