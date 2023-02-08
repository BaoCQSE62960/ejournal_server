const { Router } = require('express');
const router = Router();
const pool = require('./../db');

async function checkSession(req, res, next) {
  try {
    if (req.session.user) {
      next();
    } else {
      req.session.destroy();
      res.status(400).json();
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
}

//GET ROLE
router.get('/role', checkSession, async (req, res) => {
  try {
    res.status(200).json({ role: req.session.user.role });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

//Logout
router.post('/', async (req, res) => {
  try {
    const userLogOut = await pool.query(
      `Update "account" SET status = 'OFFLINE' WHERE id=$1`,
      [req.session.user.id]
    );
    req.session.destroy();
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Lỗi hệ thống' });
  }
});

module.exports = router;
