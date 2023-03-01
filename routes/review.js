const { Router } = require('express');
const router = Router();
const pool = require('../db');

//Assign reviewer (editor)
router.post('/assign/', async (req, res) => {
  try {
    const creatorid = req.session.user.id;
    const { articleid, reviewerid } = req.body;
    const statusarticle = 
      await pool.query(`UPDATE "article" 
        SET status = 'PENDING' 
        WHERE id = $1`,
        [ articleid ]
      );
      var createreview =
      await pool.query(`INSERT INTO "review"(articleid,accountid, creatorid ,creationtime) 
        VALUES($1,$2,$3 ,CURRENT_TIMESTAMP) RETURNING id;`,
        [
          articleid,
          reviewerid,
          creatorid
        ]
      );
    res.status(200).json({ msg: "Assign thành công" });
  } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//GET Pending article list (reviewer)
router.get('/pending/', async (req, res) => {
    try {
      const reviewerid = req.session.user.id;
      const list =
        await pool.query(`SELECT A.id, A.status
          FROM "article" AS A, "articleauthor" as AA
          WHERE A.status = 'PENDING' AND A.id = AA.articleid AND AA.accountid = $1
          ORDER BY id
          DESC`, 
          [ reviewerid ]
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
      const { reviewid } = req.body;
      const list =
        await pool.query(`SELECT *
            FROM "review"
            WHERE id = $1`, 
            [ reviewid ]
        );
      res.status(200).json({ list: list.rows });
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//Submit review (reviewer)
router.put('/submit/', async (req, res) => {
    try {
      const { id ,content, suggest } = req.body;
      var submitreview =
        await pool.query(`UPDATE "review" SET content = $1, suggest = $2 WHERE id = $3`,
          [
            content,
            suggest,
            id,
          ]
        );
      res.status(200).json({ msg: 'Gửi review thành công'});
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//view personal review (reviewer)
router.get('/reviews/', async (req, res) => {
  try {
    const userId = req.session.user.id;
    const list =
      await pool.query(`SELECT id, content FROM "review" WHERE accountid = $1`,
          [ userId ]
      );
    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GET My article reviewed list (reviewer)
router.get('/articlereviewed/', async (req, res) => {
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