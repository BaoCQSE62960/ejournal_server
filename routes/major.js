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
    const newMajor =
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
router.put('/update/', async (req, res) => {
  try {
    const { id, name } = req.body;
    const updateMajor = await pool.query(
      `UPDATE "major" 
      SET name = $2 
      WHERE id = $1`,
      [
        id,
        name
      ]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Deactive major
router.put('/deactive/', async (req, res) => {
  try {
    const { id } = req.body;
    const deactiveMajor = await pool.query(
      `UPDATE "major" SET status = 'INACTIVE' WHERE id = $1`,
      [id]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Active major
router.put('/active/', async (req, res) => {
  try {
    const { id } = req.body;
    const activeMajor = await pool.query(
      `UPDATE "major" SET status = 'ACTIVE' WHERE id = $1`,
      [id]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;