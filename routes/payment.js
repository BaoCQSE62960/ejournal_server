const { Router } = require('express');
const router = Router();
const pool = require('../db');
const sob = require('../staticObj');

async function checkRoleAdmin(req, res, next) {
  try {
    if (req.session.user.role == sob.ADMIN) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkPersonal(req, res, next) {
  try {
    if (req.session.user.role == sob.MEMBER || req.session.user.role == sob.AUTHOR) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

async function checkUniversity(req, res, next) {
  try {
    if (req.session.user.accesstype == sob.UNIVERSITY &&
      (req.session.user.role == sob.MEMBER || req.session.user.role == sob.AUTHOR)) {
      next();
    } else {
      res.status(400).json({ msg: `Vai trò của người dùng không phù hợp` });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//Submit personal payment
router.post('/submitpersonal/', checkPersonal, async (req, res) => {
  try {
    const accountid = req.session.user.id;
    const { articleid, amount } = req.body;
    var paymentinfo =
      await pool.query(`INSERT INTO "personaltransaction"(articleid, accountid, amount, creatorid, creationtime) 
          VALUES($1,$2,$3,$4,CURRENT_TIMESTAMP)`,
        [
          articleid,
          accountid,
          amount,
          req.session.user.id
        ]
      );
    res.status(200).json({ msg: "Thanh toán thành công" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Submit university payment
router.post('/submituniversity/', checkUniversity, async (req, res) => {
  try {
    const { universityid, amount, period } = req.body;
    // isexpired = false;

    // if (new Date(expirationdate) <= new Date()) {
    //   isexpired = true;
    // }

    var paymentinfo =
      await pool.query(`INSERT INTO "universitytransaction"(universityid, amount, expirationdate, isexpired) 
          VALUES($1,$2,CURRENT_TIMESTAMP::DATE + $3::integer,$4)`,
        [
          universityid,
          amount,
          period,
          false
        ]
      );
    res.status(200).json({ msg: "Thanh toán thành công" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Update university payment
router.put('/updateuniversity/', checkUniversity, async (req, res) => {
  try {
    const { paymentid, amount, period } = req.body;
    // isexpired = false;

    // if (new Date(expirationdate) <= new Date()) {
    //   isexpired = true;
    // }

    var paymentinfo =
      await pool.query(`UPDATE "universitytransaction" 
          SET amount = $1,
          expirationdate = CURRENT_TIMESTAMP::DATE + $2::integer,
          isexpired = $3
          WHERE id = $4`,
        [
          amount,
          period,
          false,
          paymentid
        ]
      );
    res.status(200).json({ msg: "Thanh toán thành công" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Get list payment of current account
router.get('/mypayment/', checkPersonal, async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT id, articleid, amount, creationtime
        FROM "personaltransaction"
        WHERE accountid = $1
        ORDER BY id
        DESC
        ;`,
        [req.session.user.id]
      );
    res.status(200).json({ list: list.rows });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Get list payment of personal account
router.get('/personalpayment/', checkRoleAdmin, async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT *
        FROM "personaltransaction"
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

//Get list payment of the university
router.get('/universitypayment/', checkRoleAdmin, async (req, res) => {
  try {
    const list =
      await pool.query(`SELECT *
        FROM "universitytransaction"
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

//Get personal payment detail
router.get('/personalpayment/:id', checkRoleAdmin, async (req, res) => {
  try {
    // const accountid = req.session.user.id;
    const { id } = req.params;
    const payment =
      await pool.query(`SELECT *
        FROM "personaltransaction"
        WHERE id = $1
        LIMIT 1
        ;`,
        [id]
      );
    res.status(200).json(payment.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

//Get university payment detail
router.get('/universitypayment/:id', checkRoleAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const paymentinfo =
      await pool.query(`SELECT *
        FROM "universitytransaction"
        WHERE id = $1
        LIMIT 1
        ;`,
        [id]
      );
    res.status(200).json(paymentinfo.rows[0]);
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống!' });
  }
});

module.exports = router;