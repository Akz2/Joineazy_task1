const express = require('express');
const pool = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// Step 1 + Step 2 two-step confirmation happens client-side (button -> modal -> confirm)
// This endpoint performs the final confirmed write.
router.post('/confirm', async (req, res) => {
  const { assignment_id, group_id } = req.body;
  if (!assignment_id || !group_id) {
    return res.status(400).json({ error: 'assignment_id and group_id are required' });
  }
  try {
    const membership = await pool.query(
      'SELECT 1 FROM group_members WHERE group_id=$1 AND user_id=$2',
      [group_id, req.user.id]
    );
    if (!membership.rows.length) {
      return res.status(403).json({ error: 'You are not a member of this group' });
    }

    const result = await pool.query(
      `INSERT INTO submissions (assignment_id, group_id, confirmed_by, status, confirmed_at)
       VALUES ($1,$2,$3,'confirmed', NOW())
       ON CONFLICT (assignment_id, group_id)
       DO UPDATE SET status='confirmed', confirmed_by=$3, confirmed_at=NOW()
       RETURNING *`,
      [assignment_id, group_id, req.user.id]
    );
    res.json({ submission: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Progress for a group across all assignments
router.get('/group/:groupId/progress', async (req, res) => {
  try {
    const totalRes = await pool.query('SELECT COUNT(*) FROM assignments');
    const confirmedRes = await pool.query(
      "SELECT COUNT(*) FROM submissions WHERE group_id=$1 AND status='confirmed'",
      [req.params.groupId]
    );
    const total = parseInt(totalRes.rows[0].count, 10);
    const confirmed = parseInt(confirmedRes.rows[0].count, 10);
    res.json({ total, confirmed, percent: total ? Math.round((confirmed / total) * 100) : 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: submission status for an assignment across all groups
router.get('/assignment/:assignmentId/status', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT g.id AS group_id, g.name AS group_name,
              COALESCE(s.status, 'pending') AS status, s.confirmed_at
       FROM groups_table g
       LEFT JOIN submissions s ON s.group_id = g.id AND s.assignment_id = $1`,
      [req.params.assignmentId]
    );
    res.json({ statuses: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
