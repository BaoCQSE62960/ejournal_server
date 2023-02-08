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
       ;
      `);
      res.status(200).json({ list: list.rows });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//Add university

//View university

//Update university

//Deactive university

//Active university

module.exports = router;