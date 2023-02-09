const { Router } = require('express');
const router = Router();
const pool = require('../db');

//GET Account list
router.get('/', async (req, res) => {
    try {
      const list =
        await pool.query(`SELECT A.id, A.fullname, A.gender, A.email, A.phone, R.name AS rolename, A.status
       FROM account AS A
       JOIN role AS R
       ON A.roleid = R.id
       ORDER BY id
       DESC
       ;
      `);
      res.status(200).json({ list: list.rows });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//Add account

//View account

//Update account

//Deactive account

//Active account

module.exports = router;