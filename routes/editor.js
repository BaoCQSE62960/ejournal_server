const { Router } = require('express');
const router = Router();
const pool = require('../db');
var nodemailer = require('nodemailer');
const _ = require('lodash');
const sob = require('../staticObj');

var transporter = nodemailer.createTransport({
    service: sob.MAIL_SERVICE,
    auth: {
        user: sob.TRANSPORT_EMAIL,
        pass: sob.TRANSPORT_PASS
    }
});

async function sendEmail(req, res, email, title, text) {
    var mailOptions = {
        from: sob.TRANSPORT_EMAIL,
        to: email,
        subject: title,
        text: text
    };

    try {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent! ');
            }
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi gửi mail' });
    }
}

async function checkRoleEditor(req, res, next) {
    try {
        if (req.session.user.role == sob.EDITOR
            || req.session.user.role == sob.CEDITOR) {
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
        const list = await pool.query(`SELECT J.id, J.title, M.name as majorname, J.status
            FROM "article" AS J 
            JOIN "major" AS M
            ON J.majorid = M.id
            WHERE J.status != $1
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
        const { id } = req.body;
        var correspondingEmail = await pool.query(
            `SELECT email
            FROM "articleauthor" 
            WHERE articleid = $1 
            AND iscorresponding = $2 
            LIMIT 1`,
            [
                id,
                true,
            ]
        );

        var acceptManuscript = await pool.query(
            `UPDATE "article" SET status = $2 WHERE id = $1`,
            [
                id,
                sob.ACCEPTED,
            ]
        );

        res.status(200).json();
        if (res.status(200)) {
            sendEmail(req, res,
                correspondingEmail.rows[0].email,
                sob.ACCEPT_MAIL_TITLE,
                sob.ACCEPT_MAIL_CONTENT);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});

//Reject article
router.put('/reject/', checkRoleEditor, async (req, res) => {
    try {
        const { id } = req.body;
        var correspondingEmail = await pool.query(
            `SELECT email
            FROM "articleauthor" 
            WHERE articleid = $1 
            AND iscorresponding = $2 
            LIMIT 1`,
            [
                id,
                true,
            ]
        );

        var rejectManuscript = await pool.query(
            `UPDATE "article" SET status = $2 WHERE id = $1`,
            [
                id,
                sob.REJECTED,
            ]
        );
        res.status(200).json();
        if (res.status(200)) {
            sendEmail(req, res,
                correspondingEmail.rows[0].email,
                sob.REJECT_MAIL_TITLE,
                sob.REJECT_MAIL_CONTENT);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});

//Revise article
router.put('/revise/', checkRoleEditor, async (req, res) => {
    try {
        const { id } = req.body;
        var correspondingEmail = await pool.query(
            `SELECT email
            FROM "articleauthor" 
            WHERE articleid = $1 
            AND iscorresponding = $2 
            LIMIT 1`,
            [
                id,
                true,
            ]
        );

        var reviseManuscript = await pool.query(
            `UPDATE "article" SET status = $2 WHERE id = $1`,
            [
                id,
                sob.REVISE,
            ]
        );

        res.status(200).json();
        if (res.status(200)) {
            sendEmail(req, res,
                correspondingEmail.rows[0].email,
                sob.REVISE_MAIL_TITLE,
                sob.REVISE_MAIL_CONTENT);
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});

//Dashboard (editor-in-chief)

module.exports = router;