const { Router } = require('express');
const router = Router();
const pool = require('../db');
const helpers = require('../utils/helpers');

//GET Account list
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT A.id, A.fullname, A.avatar, A.gender, A.email, A.phone, R.name AS rolename, A.status
        FROM account AS A
        JOIN role AS R
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
    const list =
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
//processing
//View account
router.get('/info/', async (req, res) => {
  try {
    //
    const { id } = req.body;
    //
    const list =
      await pool.query(
        `SELECT id, fullname, status
        FROM account
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

//Update account

//Deactive account

//Active account

module.exports = router;