// const { Router } = require('express');
// const router = Router();
// const pool = require('../db');

// //GET Personal article list

// //GET Personal manuscript list

// module.exports = router;

const { authJwt } = require("../middleware");
const controller = require("../controllers/accountControlle");
const { functions } = require("lodash");


module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/all", controller.allAccess);

  app.get("/api/admin", [authJwt.verifyToken, authJwt.isAdmin], controller.adminBoard);

};
