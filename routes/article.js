const { Router } = require('express');
const router = Router();
const pool = require('../db');

//GET Article list (normal)
router.get('/', async (req, res) => {
    try {
    //     JOIN "articleauthor" AS A
    //    ON J.id = A.articleid
      const list =
        await pool.query(`SELECT J.id, J.title, M.name as majorname
       FROM article AS J 
       JOIN major AS M
       ON J.majorid = M.id
       WHERE J.status = 'ACCEPTED'
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

//View article (all)

//Submit article (member, author)

//Full text article (Author, Paid, Reviewer, Editor)

module.exports = router;