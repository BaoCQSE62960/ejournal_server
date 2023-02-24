const { Router } = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');

//GET Article list
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT J.id, J.title, M.name as majorname
        FROM "article" AS J 
        JOIN "major" AS M
        ON J.majorid = M.id
        WHERE J.status = 'ACCEPTED'
        ORDER BY id
        DESC
        ;`
      );
    if (list.rows[0]) {
      var author = [];

      for (var i = 0; i < list.rows.length; i++) {
        var authorList = await pool.query(
          `SELECT fullname, email 
          FROM "articleauthor" 
          WHERE articleId = $1`,
          [list.rows[i].id]
        );

        author.push(
          _.merge(list.rows[i], {
            author: authorList.rows,
          })
        );
      }
      res.status(200).json({ list: list.rows });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View article details
router.get('/info/', async (req, res) => {
  try {
    const { id } = req.body;
    var selectedArticle =
      await pool.query(
        `SELECT A.id, M.name as major, A.title, A.summary, A.openaccess, A.status
        FROM "article" AS A
        JOIN "major" AS M ON A.majorid = M.id 
        WHERE A.id = $1
        LIMIT 1
        ;`,
        [id]
      );
    if (selectedArticle.rows[0]) {
      var author = [];
      for (var i = 0; i < selectedArticle.rows.length; i++) {
        var authorList = await pool.query(
          `SELECT fullname, email 
          FROM "articleauthor" 
          WHERE articleId = $1`,
          [id]
        );

        author.push(
          _.merge(selectedArticle.rows[i], {
            author: authorList.rows,
          })
        );
      }
      res.status(200).json({ article: selectedArticle.rows });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Submit article 
//* Nếu user là member, thay đổi role của user thành author
//* Nếu user là author thì chỉ submit article
router.post('/submit/', async (req, res) => {
  try {
    const { title, summary, content, openaccess, creatorid, majorid, authorlist } = req.body;
    var newManuscript =
      await pool.query(`INSERT INTO "article"(title,summary,content,openaccess,creatorid,creationtime,status,majorid) 
        VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,'WAITING',$6) RETURNING id;`,
        [
          title,
          summary,
          content,
          openaccess,
          creatorid,
          majorid,
        ]
      );

    for (var x = 0; x < authorlist.length; x++) {
      var detailAuthor = await pool.query(
        `INSERT INTO "articleauthor"(articleId, fullname, email) VALUES($1,$2,$3)`,
        [
          newManuscript.rows[0].id,
          authorlist[x].fullname,
          authorlist[x].email,
        ]
      );
    }
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Edit manuscript
//not available
//* chỉ cho phép chỉnh sửa bản thảo khi chưa được assign reviewer
//* chỉ có tác giả của bài viết được quyền chỉnh sửa
router.put('/manuscript/update/', async (req, res) => {
  try {
    const { id, title, summary, content, openaccess, majorid, authorlist } = req.body;
    var selectedManuscript =
      await pool.query(`UPDATE "article"
      SET title = $2, 
      summary = $3, 
      content = $4,
      openaccess = $5,
      majorid = $6 
      WHERE id = $1`,
        [
          id,
          title,
          summary,
          content,
          openaccess,
          majorid,
        ]
      );

    const authorInformation = await pool.query(
      `SELECT accountId, articleId 
      FROM "articleauthor" 
      WHERE articleId = $1`,
      [id]
    );

    for (var x = 0; x < authorlist.length; x++) {
      var detailAuthor = await pool.query(
        `UPDATE "articleauthor"
        SET accountId = $2
        WHERE articleId = $1`,
        [

          id,
          authorlist[x].authorid,
        ]
      );
    }
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//GET Manuscript list
router.get('/manuscript/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT J.id, J.title, M.name as majorname, J.status
      FROM "article" AS J 
      JOIN "major" AS M
      ON J.majorid = M.id
      WHERE J.status != 'ACCEPTED'
      ORDER BY id
      DESC
      ;`
      );
    if (list.rows[0]) {
      var author = [];

      for (var i = 0; i < list.rows.length; i++) {
        var authorList = await pool.query(
          `SELECT fullname, email 
          FROM "articleauthor" 
          WHERE articleId = $1`,
          [list.rows[i].id]
        );

        author.push(
          _.merge(list.rows[i], {
            author: authorList.rows,
          })
        );
      }
      res.status(200).json({ list: list.rows });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View manuscript details
router.get('/manuscript/info/', async (req, res) => {
  try {
    const { id } = req.body;
    var selectedManuscript =
      await pool.query(
        `SELECT A.id, M.name as major, A.title, A.summary, A.content, A.openaccess, A.status
        FROM "article" AS A
        JOIN "major" AS M ON A.majorid = M.id 
        WHERE A.id = $1
        LIMIT 1
        ;`,
        [id]
      );
    if (selectedManuscript.rows[0]) {
      var author = [];
      for (var i = 0; i < selectedManuscript.rows.length; i++) {

        var authorList = await pool.query(
          `SELECT fullname, email 
          FROM "articleauthor" 
          WHERE articleId = $1`,
          [id]
        );

        author.push(
          _.merge(selectedManuscript.rows[i], {
            author: authorList.rows,
          })
        );
      }
      res.status(200).json({ article: selectedManuscript.rows });
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Full text article
//* Nếu bài viết có openaccess = true, tất cả role đều xem được
//* User thuộc trường đại học đã trả phí và còn thời hạn
//* User cá nhân đã trả phí để xem 1 bài báo xác định
//* Author, Editor được toàn quyền xem nội dung bài báo
//* Reviewer chỉ được xem nội dung bài báo mình đang review
router.get('/public/', async (req, res) => {
  try {
    const { id } = req.body;
    const list =
      await pool.query(
        `SELECT A.id, M.name as major, A.title, A.content, A.openaccess, A.status
        FROM "article" AS A
        JOIN "major" AS M ON A.majorid = M.id 
        WHERE A.id = $1
        LIMIT 1
        ;`,
        [id]
      );
    if (list.rows[0]) {
      var author = [];

      for (var i = 0; i < list.rows.length; i++) {
        var authorList = await pool.query(
          `SELECT fullname, email 
          FROM "articleauthor" 
          WHERE articleId = $1`,
          [id]
        );
        author.push(
          _.merge(list.rows[i], {
            author: authorList.rows,
          })
        );
      }
      res.status(200).json(list.rows);
    } else {
      res.status(400).json({ msg: 'Không tìm thấy thông tin' });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;