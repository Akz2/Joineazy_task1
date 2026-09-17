import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border px-3 py-2 rounded" name="name" placeholder="Full name" onChange={change} />
        <input className="w-full border px-3 py-2 rounded" name="email" placeholder="Email" onChange={change} />
        <input className="w-full border px-3 py-2 rounded" name="password" type="password" placeholder="Password" onChange={change} />
        <select className="w-full border px-3 py-2 rounded" name="role" onChange={change}>
          <option value="student">Student</option>
          <option value="admin">Admin (Professor)</option>
        </select>
        <button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
      </form>
      <p className="text-sm mt-3">
        Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
      </p>
    </div>
  );
}
