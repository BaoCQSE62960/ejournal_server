const { Router } = require('express');
const router = Router();
const pool = require('../db');

//GET Article list
//* Một bài báo có thể có nhiều tác giả
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
    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//View article details
//* chưa test
router.get('/info/', async (req, res) => {
  try {
    const { id } = req.body;
    var articleInfo = [];
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
          `SELECT AU.id, AU.name
            FROM "articleauthor" AS AA
            JOIN "article" AS A ON AA.articleid = A.id
            JOIN "account" AS AU ON AA.accountid = AU.id
            WHERE A.id = $1`,
          [selectedArticle.rows[0].id]
        );

        author.push(
          _.merge(selectedArticle.rows[x], {
            author: authorList.rows,
          })
        );
      }
      articleInfo = _.merge(selectedArticle.rows[0], { authordetail: author });
      res.status(200).json({ article: articleInfo });
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



//Full text article
//* Nếu bài viết có openaccess = true, tất cả role đều xem được
//* User thuộc trường đại học đã trả phí và còn thời hạn
//* User cá nhân đã trả phí để xem 1 bài báo xác định
//* Author, Editor được toàn quyền xem nội dung bài báo
//* Reviewer chỉ được xem nội dung bài báo mình đang review
router.get('/info/', async (req, res) => {
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
    res.status(200).json(list.rows);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;