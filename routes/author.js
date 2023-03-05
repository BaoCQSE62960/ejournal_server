const { Router } = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const sob = require('../staticObj');
const { authJwt } = require("../middleware"); 


async function checkRoleAuthor(req, res, next) {
    try {
        if (req.session.user.role == sob.AUTHOR ) {
            next();
        } else {
            res.status(400).json({ msg: `Vai trò của người dùng không phù hợp`});

        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'lỗi hệ thống'});
    }
}

// get my manuscript (author)

router.get('my-manuscript/', checkRoleAuthor,  async (req, res) => {
    try {
        const {roleid} = req.session.user.roleid;
        const {articleid} = req.body;
        const {accountid} = req.session.user.id;
        const list = await pool.query(`SELECT A.name, R.name, J.id, J.title 
        FROM "account" AS A
        JOIN "role" AS R ON A.roleid = R.id, 
        "article" AS J 
        JOIN "articleauthor" as AA ON J.id = AA.articleid,
        "account" AS A 
        JOIN "articleauthor" as AA ON A.id = AA.accountid
        WHERE R.id = $1 AND J.id = $2 AND A.id = accountid
        ORDER BY id
        DESC`,
        [
            roleid,
            articleid,
            accountid
        ]
        );
        if(list.rows[0]){
            res.status(200).json({list: list.rows})
        }else {
            res.status(400).json({ msg: 'Không tìm thấy thông tin'});
        }


    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống!' });
    }
});




