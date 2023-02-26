const { Router } = require('express');
const router = Router();
const pool = require('../db.js');
const helpers = require('../utils/helpers');

//GET Account list
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT A.id, A.fullname, A.avatar, A.gender, A.email, A.phone, R.name AS rolename, A.status
        FROM "account" AS A
        JOIN "role" AS R
        ON A.roleid = R.id
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

//Add account
router.put('/add/', async (req, res) => {
  try {
    const { username, password, fullname, avatar, gender, phone, email, accesstype, roleid } = req.body;
    const newAccount =
      await pool.query(`INSERT INTO "account"(username,password,fullname,avatar,gender,phone,email,accesstype,status,roleid) 
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,'OFFLINE',$9) RETURNING id;`,
        [
          username,
          await helpers.hashPassword(
            password
          ),
          fullname,
          avatar,
          gender,
          phone,
          email,
          accesstype,
          roleid,
        ]
      );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View account
router.post('/info/', async (req, res) => {
  try {
    const { id } = req.body;
    const list =
      await pool.query(
        `SELECT A.id, A.username, A.fullname, A.avatar, A.gender, A.phone, A.email, A.status, R.name AS role
        FROM "account" AS A
        JOIN "role" AS R ON A.roleid = R.id 
        WHERE A.id = $1
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

//Update account
router.put('/update/', async (req, res) => {
  try {
    const { id, roleid } = req.body;
    const updateAccount = await pool.query(
      `UPDATE "account" 
      SET roleid = $2 
      WHERE id = $1`,
      [
        id,
        roleid
      ]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Deactive account
router.put('/deactive/', async (req, res) => {
  try {
    const { id } = req.body;
    const deactiveAccount = await pool.query(
      `UPDATE "account" SET status = 'INACTIVE' WHERE id = $1`,
      [id]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Active account
router.put('/active/', async (req, res) => {
  try {
    const { id } = req.body;
    const activeAccount = await pool.query(
      `UPDATE "account" SET status = 'OFFLINE' WHERE id = $1`,
      [id]
    );
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;