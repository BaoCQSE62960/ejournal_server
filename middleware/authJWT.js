const jwt = require("jsonwebtoken");
const config = require("../config/authConfig.js");
const db = require("../models");
const Account = db.account;

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
  
    if (!token) {
      return res.status(403).send({
        message: "No token provided!"
      });
    }
    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return res.status(401).send({
            message: "Unauthorized!"
          });
        }
        req.userId = decoded.id;
        next();
      });
    };


    isAdmin = (req, res, next) => {
        Account.findByPk(req.roleId).then(account => {
          account.getRoleID().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === "ADMIN") {
                next();
                return;
              }
            }
      
            res.status(403).send({
              message: "Require Admin Role!"
            });
            return;
          });
        });
      };



      isMember = (req, res, next) => {
        Account.findByPk(req.roleId).then(account => {
          account.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === "MEMBER") {
                next();
                return;
              }
            }
      
            res.status(403).send({
              message: "Require Member Role!"
            });
          });
        });
      };

      isAuthor = (req, res, next) => {
        Account.findByPk(req.roleId).then(account => {
          account.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === "AUTHOR") {
                next();
                return;
              }
            }
      
            res.status(403).send({
              message: "Require Author Role!"
            });
          });
        });
      };

      isReviewer = (req, res, next) => {
        Account.findByPk(req.roleId).then(account => {
          account.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === "REVIEWER") {
                next();
                return;
              }
            }
      
            res.status(403).send({
              message: "Require Reviewer Role!"
            });
          });
        });
      };

      isEditor = (req, res, next) => {
        Account.findByPk(req.roleId).then(account => {
          account.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === "EDITOR") {
                next();
                return;
              }
            }
      
            res.status(403).send({
              message: "Require Editor Role!"
            });
          });
        });
      };
      isEditorInChief= (req, res, next) => {
        Account.findByPk(req.roleId).then(account => {
          account.getRoles().then(roles => {
            for (let i = 0; i < roles.length; i++) {
              if (roles[i].name === "EDEDITOR_IN_CHIEFITOR") {
                next();
                return;
              }
            }
      
            res.status(403).send({
              message: "Require Editor in chief Role!"
            });
          });
        });
      };

      const authJwt = {
        verifyToken: verifyToken,
        isAdmin: isAdmin,
        isMember: isMember,
        isAuthor: isAuthor,
        isReviewer: isReviewer,
        isEditor: isEditor,
        isEditorInChief: isEditorInChief,
        // isModerator: isModerator,
        // isModeratorOrAdmin: isModeratorOrAdmin
      };
      module.exports = authJwt;