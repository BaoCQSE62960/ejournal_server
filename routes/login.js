const { Router } = require('express');
const { split } = require('lodash');
const router = Router();
const pool = require('./../db');
const helpers = require('./../utils/helpers');

async function validateUser(req, res, next) {
  try {
    const { username, password } = req.body;
    const userInformation = await pool.query(
      'SELECT A.id, A.username, A.password, A.fullname,R.name AS role FROM "account" AS A JOIN "role" AS R ON A.roleid = R.id WHERE A.username = $1 LIMIT 1',
      [username]
    );
    if (userInformation.rows[0]) {
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
    } else {
      res.status(400).json({ msg: 'Tên đăng nhập hoặc mật khẩu sai' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//Login
router.post('/', validateUser,
  async (req, res) => {
    try {
      //Get user information
      if (req.session.user) {
        const updateUserStatus = await pool.query(
          'Update "account" SET status = \'ONLINE\' WHERE id=$1',
          [req.session.user.id]
        );
        res.status(200).json({ role: req.session.user.role });
      } else {
        req.session.destroy();
        res.status(400).json({ msg: 'Lỗi hệ thống' });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  }
);

//Register
router.post('/register/',
  async (req, res) => {
    try {
      const { username, password, fullname, avatar, gender, phone, email } = req.body;

      // accesstype
      accesstype = '';
      const domain = email.split('@')[1];
      const listMailType =
      await pool.query(`SELECT mailtype FROM university WHERE mailtype = $1`,
        [
          domain
        ]
      );
      if(listMailType.rows[0]){
        accesstype = 'UNIVERSITY';
      } else {
        accesstype = 'PERSONAL';
      }
      // password
      const hashPassword = await helpers.hashPassword(password);

      // query
      const list =
      await pool.query(`INSERT INTO "account"(username,password,fullname,avatar,gender,phone,email,accesstype,status,roleid) 
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,'OFFLINE',2) RETURNING id;`,
        [
          username,
          hashPassword,
          fullname,
          avatar,
          gender,
          phone,
          email,
          accesstype
        ]
      );

      res.status(200).json({ msg: 'Đăng ký thành công', accesstype: accesstype });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
  }
);

module.exports = router;
