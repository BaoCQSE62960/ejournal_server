const { Router } = require('express');
const router = Router();
const pool = require('../db');
const helpers = require('./../utils/helpers');

//Change password
router.put('/changepassword/', async (req, res) => {
    try {
        const userId = req.session.user.id;
        const { oldPassword, newPassword } = req.body;
        const hashedNewPassword = await helpers.hashPassword(newPassword);
        const getPassword = await pool.query(
            `SELECT password FROM "account" WHERE id = $1`,
            [
                userId
            ]
        );
        if (await helpers.validatePassword(oldPassword, getPassword.rows[0].password)) {
            const userChangePassword =
                await pool.query(
                    `UPDATE "account" SET password = $1 WHERE id=$2`,
                    [
                        hashedNewPassword,
                        userId
                    ]
                );
            res.status(200).json({ msg: 'Đổi mật khẩu thành công' });
        } else {
            res.status(400).json({ msg: 'Lỗi hệ thống' });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Lỗi hệ thống' });
    }
});

//View personal profile

//Update personal profile

module.exports = router;