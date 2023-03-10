const { Router } = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const sob = require('../staticObj');

async function checkRoleSubmit(req, res, next) {
  try {
    if (req.session.user.role == sob.AUTHOR) {
      next();
    } else if (req.session.user.role == sob.MEMBER) {
      var roleUpdate = await pool.query(
        `UPDATE "account" SET roleid = $2 WHERE id = $1`,
        [
          req.session.user.id,
          sob.AUTHOR_ID
        ]
      );
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//* Nếu bài viết có openaccess = true, tất cả role đều xem được
async function checkOpenAccess(req, res, next) {
  try {
    const { id } = req.body;
    const openAccess = await pool.query(
      `SELECT id, openaccess
      FROM "article" 
      WHERE A.id = $1 
      LIMIT 1`,
      [id]
    );
    if (openAccess.rows[0]) {
      req.session.openAccess = true;
      next();
    } else {
      req.session.openAccess = false;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//* User thuộc trường đại học đã trả phí và còn thời hạn
//* User cá nhân đã trả phí để xem 1 bài báo xác định
//* Author của bài báo và Editor được toàn quyền xem nội dung bài báo
//* Reviewer chỉ được xem nội dung bài báo mình đang review
async function checkAccountAccess(req, res, next) {
  try {
    const { id } = req.body;
    const access = await pool.query(
      `SELECT id, email, accesstype
      FROM "account" 
      WHERE id = $1 
      LIMIT 1`,
      [req.session.user.id]
    );

    if (access.rows[0]) {
      if (access.rows[0].accesstype == sob.STUDENT) {
        const mailType = access.rows[0].email.split('@')[1];

        const universityTran =
          await pool.query(`SELECT U.id, U.mailtype, UT.expirationdate AS expirationdate, UT.isexpired AS isexpired
            FROM "university" AS U
            JOIN "universitytransaction" AS UT ON UT.universityid = U.id 
            WHERE mailtype = $1`,
            [mailType]
          );

        if (universityTran.rows[0]) {
          req.session.universityTran = universityTran.rows[0];
        } else {
          req.session.universityTran = null;
        }

      } else if (access.rows[0].accesstype == sob.PERSONAL) {
        const personalTran =
          await pool.query(`SELECT * FROM  "personaltransaction" WHERE articleid = $1 AND accountid = $2`,
            [
              id,
              req.session.user.id
            ]
          );

        if (personalTran.rows[0]) {
          req.session.personalTran = personalTran.rows[0];
        } else {
          req.session.personalTran = null;
        }
      }

      next();
    } else {
      res.status(400).json({ msg: `Không tìm thấy thông tin access` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkRoleAuthor(req, res, next) {
  try {
    if (req.session.user.role == sob.AUTHOR) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkCorresponding(req, res, next) {
  try {
    const { id, title, summary, content, openaccess, majorid, authorlist } = req.body;
    const correspondingAuthor = await pool.query(
      `SELECT AA.id, AA.articleid, AA.accountid, A.fullname AS fullname, A.email AS email, M.status AS status, AA.iscorresponding
      FROM "articleauthor" AS AA 
      JOIN "account" AS A 
      ON A.id = AA.accountid 
      JOIN "article" AS M 
      ON M.id = AA.articleid 
      WHERE AA.articleid = $1 
      AND AA.accountid = $2 
      AND AA.iscorresponding = $3 
      LIMIT 1`,
      [
        id,
        req.session.user.id,
        true
      ]
    );
    if (correspondingAuthor.rows[0]) {
      req.session.article = correspondingAuthor.rows[0];
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của tác giả không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkArticleStatus(req, res, next) {
  try {
    if ((req.session.article.status == sob.WAITING)
      || req.session.article.status == sob.REVISE) {
      next();
    } else {
      res.status(400).json({ msg: `Không được phép cập nhật` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//GET Article list (public)
router.get('/', async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT A.id, A.title, M.name as majorname, A.openaccess
        FROM "article" AS A 
        JOIN "major" AS M
        ON A.majorid = M.id
        WHERE A.status = $1
        ORDER BY id
        DESC
        ;`,
        [sob.ACCEPTED]
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
            author: authorList.rows
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

//View article details (public)
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
            author: authorList.rows
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

//GET Major list for submit
router.get('/submit/major', checkRoleSubmit, async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT id, name
        FROM "major"
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

//Submit article (author)
//DONE Nếu user là member, thay đổi role của user thành author
//DONE Nếu user là author thì chỉ submit article
//* FE danh sách tác giả bắt buộc phải có 1 corresponding author chịu trách nhiệm chính
/*DONE Nếu author có tài khoản trong danh sách account thì khi điển đúng
email và fullname, hệ thống sẽ tự động thêm accountId tương ứng */
router.post(
  '/submit/', checkRoleSubmit, async (req, res) => {
    try {
      const { title, summary, content, openaccess, majorid, authorlist } = req.body;
      var author = [];

      var newManuscript =
        await pool.query(`INSERT INTO "article"(title,summary,content,openaccess,creatorid,creationtime,status,majorid) 
          VALUES($1,$2,$3,$4,$5,CURRENT_TIMESTAMP,$6,$7) RETURNING id;`,
          [
            title,
            summary,
            content,
            openaccess,
            req.session.user.id,
            sob.WAITING,
            majorid
          ]
        );

      for (var x = 0; x < authorlist.length; x++) {
        var authorItem = await pool.query(
          `SELECT id, fullname, email
          FROM "account" 
          WHERE fullname = $1 
          AND email = $2`,
          [
            authorlist[x].fullname,
            authorlist[x].email
          ]
        );

        if (authorItem.rows[0]) {

          for (var i = 0; i < authorItem.rows.length; i++) {
            var detailAccountAuthor = await pool.query(
              `INSERT INTO "articleauthor"(articleId, accountId, fullname, email, iscorresponding) VALUES($1,$2,$3,$4,$5)`,
              [
                newManuscript.rows[0].id,
                authorItem.rows[i].id,
                authorItem.rows[i].fullname,
                authorItem.rows[i].email,
                authorlist[x].iscorresponding
              ]
            );

            author.push(
              _.merge(authorItem.rows[i], {
                author: detailAccountAuthor.rows
              })
            );
          }

        } else {

          var detailFreeAuthor = await pool.query(
            `INSERT INTO "articleauthor"(articleId, fullname, email, iscorresponding) VALUES($1,$2,$3,$4)`,
            [
              newManuscript.rows[0].id,
              authorlist[x].fullname,
              authorlist[x].email,
              authorlist[x].iscorresponding
            ]
          );

          author.push(
            _.merge(authorItem.rows[i], {
              author: detailFreeAuthor.rows
            })
          );
        }
      }
      res.status(200).json();
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//Edit manuscript (author)
//DONE chỉ cho phép chỉnh sửa bản thảo khi status là REVISE hoặc khi trạng thái là WAITING
//FE danh sách tác giả bắt buộc phải có 1 corresponding author chịu trách nhiệm chính
//DONE chỉ có corresponding author được quyền chỉnh sửa
/*DONE Nếu author có tài khoản trong danh sách account thì khi điển đúng
email và fullname, hệ thống sẽ tự động thêm accountId tương ứng */
router.put('/manuscript/update/',
  checkRoleAuthor,
  checkCorresponding,
  checkArticleStatus,
  async (req, res) => {
    try {
      var author = [];

      var selectedManuscript = await pool.query(
        `UPDATE "article" 
        SET title = $2, 
        summary = $3, 
        content = $4, 
        openaccess = $5, 
        majorid = $6, 
        status = $7 
        WHERE id = $1`,
        [
          req.body.id,
          req.body.title,
          req.body.summary,
          req.body.content,
          req.body.openaccess,
          req.body.majorid,
          sob.WAITING
        ]
      );

      for (var i = 0; i < req.body.authorlist.length; i++) {
        var deleteAuthor = await pool.query(
          `DELETE FROM "articleauthor" 
          WHERE articleId = $1 AND iscorresponding = $2`,
          [
            req.body.id,
            false
          ]
        );
      }

      for (var x = 0; x < req.body.authorlist.length; x++) {
        var authorItem = await pool.query(
          `SELECT id, fullname, email
          FROM "account" 
          WHERE fullname = $1 
          AND email = $2`,
          [
            req.body.authorlist[x].fullname,
            req.body.authorlist[x].email
          ]
        );

        if (authorItem.rows[0]) {

          for (var i = 0; i < authorItem.rows.length; i++) {
            var detailAccountAuthor = await pool.query(
              `INSERT INTO "articleauthor"(articleId, accountId, fullname, email, iscorresponding) VALUES($1,$2,$3,$4,$5)`,
              [
                req.body.id,
                authorItem.rows[i].id,
                authorItem.rows[i].fullname,
                authorItem.rows[i].email,
                false
              ]
            );

            author.push(
              _.merge(authorItem.rows[i], {
                author: detailAccountAuthor.rows
              })
            );
          }

        } else {

          var detailFreeAuthor = await pool.query(
            `INSERT INTO "articleauthor"(articleId, fullname, email, iscorresponding) VALUES($1,$2,$3,$4)`,
            [
              req.body.id,
              req.body.authorlist[x].fullname,
              req.body.authorlist[x].email,
              false
            ]
          );

          author.push(
            _.merge(authorItem.rows[i], {
              author: detailFreeAuthor.rows
            })
          );
        }
      }

      res.status(200).json();
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//Delete manuscript (author)
//* chỉ cho phép xóa bản thảo khi chưa được assign reviewer
router.delete('/manuscript/delete/',
  checkRoleAuthor,
  async (req, res) => {
    try {
      const { id } = req.body;

      var deleteAuthor = await pool.query(
        `DELETE FROM "articleauthor" WHERE articleId = $1`,
        [id]
      );

      var deleteManuscript = await pool.query(
        `DELETE FROM "article" WHERE id = $1`,
        [id]
      );

      res.status(200).json();
    } catch (error) {
      console.log(error);
      res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
  });

//View manuscript details (author, reviewer, editor)
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
            author: authorList.rows
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
//* Author của bài báo và Editor được toàn quyền xem nội dung bài báo
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
            author: authorList.rows
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