const { Router } = require('express');
const router = Router();
const pool = require('../db');

//GET Role list
router.get('/role/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT id, name
       FROM role
       ORDER BY id
       DESC
       ;`
      );
    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GET Personal transaction list

//GET University transaction list

module.exports = router;