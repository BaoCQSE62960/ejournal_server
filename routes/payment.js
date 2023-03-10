const { Router } = require('express');
const router = Router();
const pool = require('../db');

//Submit personal payment
router.post('/submitpersonal/', async (req, res) => {
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
router.post('/submituniversity/', async (req, res) => {
  try {
    const { universityid, amount, period } = req.body;
    // isexpired = false;

    // if (new Date(expirationdate) <= new Date()) {
    //   isexpired = true;
    // }

    var paymentinfo =
      await pool.query(`INSERT INTO "universitytransaction"(universityid, amount, expirationdate, isexpired) 
          VALUES($1,$2,CURRENT_TIMESTAMP + $3,$4)`,
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
router.put('/updateuniversity/', async (req, res) => {
  try {
    const { paymentid, amount, period } = req.body;
    // isexpired = false;

    // if (new Date(expirationdate) <= new Date()) {
    //   isexpired = true;
    // }

    var paymentinfo =
      await pool.query(`UPDATE "universitytransaction" 
          SET amount = $1,
          expirationdate = CURRENT_TIMESTAMP + $2,
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
router.get('/personalpayment/', async (req, res) => {
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
router.get('/universitypayment/', async (req, res) => {
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
router.get('/personalpayment/:id', async (req, res) => {
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
router.get('/universitypayment/:id', async (req, res) => {
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