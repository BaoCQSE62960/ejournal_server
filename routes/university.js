const { Router } = require('express');
const router = Router();
const pool = require('../db');

//GET University list
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT id, name, email, mailtype, status
       FROM university
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

//Add university
router.put('/add/', async (req, res) => {
  try {
    const { name, email, mailtype } = req.body;
    const list =
      await pool.query(`INSERT INTO "university"(name, email, mailtype, status) VALUES($1,'ACTIVE') RETURNING id;`,
        [
          name,
          email,
          mailtype,
        ]
      );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View university

//Update university

//Deactive university

//Active university

module.exports = router;