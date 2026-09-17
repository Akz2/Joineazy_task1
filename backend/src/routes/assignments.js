const express = require('express');
const pool = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Admin: create assignment
router.post('/', requireRole('admin'), async (req, res) => {
  const { title, description, due_date, onedrive_link, target_type, target_group_id } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const result = await pool.query(
      `INSERT INTO assignments (title, description, due_date, onedrive_link, created_by, target_type, target_group_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [title, description, due_date, onedrive_link, req.user.id, target_type || 'all', target_group_id || null]
    );
    res.status(201).json({ assignment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: edit assignment
router.put('/:id', requireRole('admin'), async (req, res) => {
  const { title, description, due_date, onedrive_link } = req.body;
  try {
    const result = await pool.query(
      `UPDATE assignments SET title=$1, description=$2, due_date=$3, onedrive_link=$4
       WHERE id=$5 RETURNING *`,
      [title, description, due_date, onedrive_link, req.params.id]
    );
    res.json({ assignment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All roles: list assignments (students see relevant ones)
router.get('/', async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await pool.query('SELECT * FROM assignments ORDER BY created_at DESC');
    } else {
      result = await pool.query(
        `SELECT DISTINCT a.* FROM assignments a
         LEFT JOIN group_members gm ON gm.group_id = a.target_group_id
         WHERE a.target_type = 'all' OR gm.user_id = $1
         ORDER BY a.created_at DESC`,
        [req.user.id]
      );
    }
    res.json({ assignments: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: analytics summary
router.get('/:id/analytics', requireRole('admin'), async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM groups_table');
    const confirmed = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE assignment_id=$1 AND status='confirmed'",
      [req.params.id]
    );
    res.json({
      totalGroups: parseInt(total.rows[0].count, 10),
      confirmedGroups: parseInt(confirmed.rows[0].count, 10),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
