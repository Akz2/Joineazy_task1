import { useState } from 'react';
import api from '../api/axios';

export default function GroupForm({ onCreated }) {
  const [name, setName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [group, setGroup] = useState(null);
  const [memberError, setMemberError] = useState('');

  const createGroup = async (e) => {
    e.preventDefault();
    const res = await api.post('/groups', { name });
    setGroup(res.data.group);
    onCreated && onCreated(res.data.group);
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!group) return;
    setMemberError('');
    try {
      await api.post(`/groups/${group.id}/members`, { email: memberEmail });
      setMemberEmail('');
    } catch (err) {
      setMemberError(err.response?.data?.error || 'Unable to add member');
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow-sm space-y-3">
      <form onSubmit={createGroup} className="flex gap-2">
        <input
          className="border px-2 py-1 rounded flex-1"
          placeholder="Group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded">Create Group</button>
      </form>

      {group && (
        <form onSubmit={addMember} className="flex gap-2">
          <input
            className="border px-2 py-1 rounded flex-1"
            placeholder="Member email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button className="bg-gray-700 text-white px-3 py-1 rounded">Add Member</button>
        </form>
      )}
      {memberError && <p className="text-sm text-red-600">{memberError}</p>}
    </div>
  );
}
