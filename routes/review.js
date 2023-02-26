const { Router } = require('express');
const router = Router();
const pool = require('../db');

//Assign reviewer (editor)

//GET Pending manuscript list (reviewer)
router.get('/pending/', async (req, res) => {
    try {
      const list =
        await pool.query(`SELECT id
            FROM "article"
            WHERE status = 'PENDING'
            ORDER BY id
            DESC`
        );
      res.status(200).json({ list: list.rows });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//View review (editor, author)
router.get('/view/', async (req, res) => {
    try {
      const { id } = req.body;
      const list =
        await pool.query(`SELECT *
            FROM "review"
            WHERE id = $1`, 
            [ id ]
        );
      res.status(200).json({ list: list.rows });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//Submit review (reviewer)
router.post('/submit/', async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { articleid, accountid, content, suggest } = req.body;
      var newManuscript =
        await pool.query(`INSERT INTO "review"(articleid,accountid,content,suggest,creatorid,creationtime) 
          VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP) RETURNING id;`,
          [
            articleid,
            accountid,
            content,
            suggest,
            userId,
          ]
        );
      res.status(200).json({ msg: 'Gửi review thành công'});
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//view personal review (reviewer)

//GET My article reviewed list (reviewer)
router.get('/myreviewed/', async (req, res) => {
    try {
      const userId = req.session.user.id;
      const list =
        await pool.query(`SELECT R.id as reviewid ,A.id as articleid, A.title
            FROM "article" AS A
            JOIN "review" AS R
            ON A.id = R.creatorid
            WHERE R.creatorid = $1
            ORDER BY reviewid
            DESC`,
            [ userId ]
        );
      res.status(200).json({ list: list.rows });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

module.exports = router;