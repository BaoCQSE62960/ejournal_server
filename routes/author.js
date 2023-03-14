const { Router } = require('express');
const router = Router();
const pool = require('../db');
const _ = require('lodash');
const sob = require('../staticObj');



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

router.get('/myManuscript/', checkRoleAuthor,  async (req, res) => {
    try {
        const {accountid} = req.session.user.id;
        const list = await pool.query(`SELECT A.username, C.title 
        FROM "account" AS A
        JOIN "articleauthor" as T 
		ON A.id = T.accountid
		JOIN "article" AS C ON C.id = T.articleid
		WHERE T.accountid = $1;`,
        [
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

module.exports = router;



