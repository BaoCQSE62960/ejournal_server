const { Router } = require('express');
const router = Router();
const pool = require('../db');

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
          password,
          fullname,
          avatar,
          gender,
          phone,
          email,
          accesstype,
          roleid,
        ]
      );
    if (list.rows[0]) {
      if (
        await helpers.validatePassword(
          password,
          userInformation.rows[0].password
        )
      ) {
        req.session.user = userInformation.rows[0];
        next();
      } else {
        res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai' });
      }
    }
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View account

//Update account

//Deactive account

//Active account

module.exports = router;