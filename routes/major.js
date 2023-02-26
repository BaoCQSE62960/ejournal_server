const { Router } = require('express');
const router = Router();
const pool = require('../db');

//GET Major list
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT id, name, status
        FROM "major"
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

//Add major
router.put('/add/', async (req, res) => {
  try {
    const { name } = req.body;
    const list =
      await pool.query(`INSERT INTO "major"(name,status) VALUES($1,'ACTIVE') RETURNING id;`,
        [name]
      );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View major
router.get('/info/', async (req, res) => {
  try {
    const { id } = req.body;
    const list =
      await pool.query(
        `SELECT id, name, status
        FROM "major"
        WHERE id = $1
        LIMIT 1
        ;`,
        [id]
      );
    res.status(200).json(list.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Update major

//Deactive major

//Active major

module.exports = router;