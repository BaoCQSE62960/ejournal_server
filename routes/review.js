const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');

async function checkRoleViewAllReview(req, res, next) {
  try {
    if (req.session.user.role == sob.EDITOR || req.session.user.role == sob.AUTHOR) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkRoleEditor(req, res, next) {
  try {
    if (req.session.user.role == sob.EDITOR) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkRoleReviewer(req, res, next) {
  try {
    if (req.session.user.role == sob.REVIEWER) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//Assign reviewer (editor)
router.post('/assign/', checkRoleEditor, async (req, res) => {
  try {
    const creatorid = req.session.user.id;
    const { articleid, reviewerid } = req.body;

    const statusArticle =
      await pool.query(`UPDATE "article" 
        SET status = 'PENDING' 
        WHERE id = $1`,
        [articleid]
      );

    var createReview =
      await pool.query(`INSERT INTO "review"(articleid, accountid, creatorid, creationtime) 
        VALUES($1,$2,$3,CURRENT_TIMESTAMP) RETURNING id;`,
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
router.get('/pending/', checkRoleReviewer, async (req, res) => {
  try {
    const reviewerid = req.session.user.id;

    const list =
      await pool.query(`SELECT A.id, A.title, M.name as majorname
        FROM "article" AS A
        JOIN "review" AS R ON A.id = R.articleid 
        JOIN "major" AS M ON A.majorid = M.id 
        WHERE A.status = $1 AND R.accountid = $2
        ORDER BY id
        DESC`,
        [
          sob.PENDING,
          reviewerid
        ]
      );

    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View review (editor, author)
router.get('/view/all/', checkRoleViewAllReview, async (req, res) => {
  try {
    const { articleid } = req.body;

    const list =
      await pool.query(`SELECT * FROM "review" WHERE articleid = $1`,
        [articleid]
      );

    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Submit review (reviewer)
router.put('/submit/', checkRoleReviewer, async (req, res) => {
  try {
    const { articleid, content, suggest } = req.body;

    var submitReview =
      await pool.query(`UPDATE "review" 
        SET content = $3, 
        suggest = $4 
        WHERE articleid = $1 
        AND accountid = $2`,
        [
          articleid,
          req.session.user.id,
          content,
          suggest
        ]
      );

    res.status(200).json({ msg: 'Gửi review thành công' });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//view personal review (reviewer)
router.get('/reviews/', checkRoleReviewer, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { articleid } = req.body;

    const list =
      await pool.query(`SELECT id, content FROM "review" 
        WHERE accountid = $1
        AND articleid = $2`,
        [
          userId,
          articleid
        ]
      );

    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GET My article reviewed list (reviewer)
router.get('/articlereviewed/', checkRoleReviewer, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const list =
      await pool.query(`SELECT R.id as reviewid, A.id as articleid, A.title
        FROM "article" AS A
        JOIN "review" AS R
        ON A.id = R.creatorid
        WHERE R.creatorid = $1
        ORDER BY reviewid
        DESC`,
        [userId]
      );

    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;