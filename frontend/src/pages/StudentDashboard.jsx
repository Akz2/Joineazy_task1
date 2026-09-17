import { useEffect, useState } from 'react';
import api from '../api/axios';
import GroupForm from '../components/GroupForm';
import AssignmentCard from '../components/AssignmentCard';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState({ percent: 0 });

  const loadGroups = async () => {
    const res = await api.get('/groups');
    setGroups(res.data.groups);
    if (res.data.groups.length && !activeGroup) setActiveGroup(res.data.groups[0]);
  };

  const loadAssignments = async () => {
    const res = await api.get('/assignments');
    setAssignments(res.data.assignments);
  };

  const loadProgress = async () => {
    if (!activeGroup) return;
    const res = await api.get(`/submissions/group/${activeGroup.id}/progress`);
    setProgress(res.data);
  };

  useEffect(() => { loadGroups(); loadAssignments(); }, []);
  useEffect(() => { loadProgress(); }, [activeGroup]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
        <button onClick={logout} className="text-red-600 text-sm">Logout</button>
      </div>

      <GroupForm onCreated={loadGroups} />

      {groups.length > 0 && (
        <div>
          <label className="text-sm font-medium">Active group: </label>
          <select
            className="border rounded px-2 py-1"
            value={activeGroup?.id || ''}
            onChange={(e) => setActiveGroup(groups.find((g) => g.id === Number(e.target.value)))}
          >
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      )}

      {activeGroup && (
        <div>
          <h2 className="font-semibold mb-1">Group Progress</h2>
          <ProgressBar percent={progress.percent} />
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Assignments</h2>
        {assignments.map((a) => (
          <AssignmentCard
            key={a.id}
            assignment={a}
            groupId={activeGroup?.id}
            onConfirmed={loadProgress}
          />
        ))}
      </div>
    </div>
  );
}
