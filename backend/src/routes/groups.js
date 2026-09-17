const express = require('express');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Create a group
router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Group name is required' });
  try {
    const group = await pool.query(
      'INSERT INTO groups_table (name, created_by) VALUES ($1,$2) RETURNING *',
      [name, req.user.id]
    );
    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1,$2)',
      [group.rows[0].id, req.user.id]
    );
    res.status(201).json({ group: group.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a member by email or student ID
router.post('/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;
  try {
    const userRes = await pool.query('SELECT id, name, email FROM users WHERE email=$1 AND role=$2', [email, 'student']);
    if (!userRes.rows.length) return res.status(404).json({ error: 'Student not found' });

    await pool.query(
      'INSERT INTO group_members (group_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [groupId, userRes.rows[0].id]
    );
    res.json({ added: userRes.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List groups for logged-in student (or all groups for admin)
router.get('/', async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM groups_table ORDER BY created_at DESC');
    } else {
      result = await pool.query(
        `SELECT g.* FROM groups_table g
         JOIN group_members gm ON gm.group_id = g.id
         WHERE gm.user_id = $1`,
        [req.user.id]
      );
    }
    res.json({ groups: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get members of a group
router.get('/:groupId/members', async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = $1`,
      [groupId]
    );
    res.json({ members: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
