const express = require('express');
const db      = require('../db');
const router  = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ success: false, message: 'Please login first.' });
  next();
}

// ── GET /api/addresses ──────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  const [rows] = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC', [req.session.userId]);
  res.json({ success: true, addresses: rows });
});

// ── POST /api/addresses ─────────────────────────────────────
router.post('/', requireAuth, async (req, res) => {
  try {
    const { label, flat, street, landmark, city, state, pincode, is_default } = req.body;
    if (!street || !city || !state || !pincode)
      return res.status(400).json({ success: false, message: 'Street, city, state and pincode are required.' });

    if (is_default) {
      await db.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.session.userId]);
    }

    const [result] = await db.query(
      'INSERT INTO addresses (user_id, label, flat, street, landmark, city, state, pincode, is_default) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.session.userId, label || 'Home', flat || '', street, landmark || '', city, state, pincode, is_default ? 1 : 0]
    );

    const [rows] = await db.query('SELECT * FROM addresses WHERE id = ?', [result.insertId]);
    res.json({ success: true, address: rows[0] });
  } catch (err) {
    console.error('Address error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DELETE /api/addresses/:id ───────────────────────────────
router.delete('/:id', requireAuth, async (req, res) => {
  await db.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.session.userId]);
  res.json({ success: true });
});

module.exports = router;
