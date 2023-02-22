// const { Router } = require('express');

// const pool = require('../db');

// //GET Personal article list

// //GET Personal manuscript list

// module.exports = router;

const { authJwt } = require("../middleware");
const controller = require("../controllers/accountControlle");




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

  app.get("/api/member", [authJwt.verifyToken, authJwt.isMember], controller.memberBoard);
   app.get("/api/author", [authJwt.verifyToken, authJwt.isAuthor], controller.authorBoard);
  app.get("/api/reviewer", [authJwt.verifyToken, authJwt.isReviewer], controller.reviewerBoard);
  app.get("/api/editor", [authJwt.verifyToken, authJwt.isEditor], controller.editorBoard);
  app.get("/api/editor-in-chief", [authJwt.verifyToken, authJwt.isEditorInChief], controller.editorInChiefBoard);

};
