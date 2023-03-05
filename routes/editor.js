const { Router } = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const sob = require('../staticObj');

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

async function checkRoleEditorInChief(req, res, next) {
    try {
        if (req.session.user.role == sob.CEDITOR) {
            next();
        } else {
            res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
}

//GET Manuscript list (Editor)
router.get('/manuscript/', checkRoleEditor, async (req, res) => {
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

//Accept article
router.put('/accept/', checkRoleEditor, async (req, res) => {
    try {
        var selectedManuscript = await pool.query(
            `UPDATE "article" SET status = $2 WHERE id = $1`,
            [
                req.body.id,
                sob.ACCEPTED,
            ]
        );
        res.status(200).json();
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});

//Reject article
router.put('/reject/', checkRoleEditor, async (req, res) => {
    try {
        var selectedManuscript = await pool.query(
            `UPDATE "article" SET status = $2 WHERE id = $1`,
            [
                req.body.id,
                sob.REJECTED,
            ]
        );
        res.status(200).json();
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});

//Revise article
router.put('/revise/', checkRoleEditor, async (req, res) => {
    try {
        var selectedManuscript = await pool.query(
            `UPDATE "article" SET status = $2 WHERE id = $1`,
            [
                req.body.id,
                sob.REVISE,
            ]
        );
        res.status(200).json();
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});

//Dashboard (editor-in-chief)

module.exports = router;