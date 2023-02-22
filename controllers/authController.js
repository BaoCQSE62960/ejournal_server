const db = require("../models");
const config = require("../config/authConfig");
const Account = db.account;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const { account } = require("../models");

exports.signin = (req, res) => {
    Account.findOne({
      where: {
        username: req.body.userName
      }
    })
      .then(account => {
        if (!account) {
          return res.status(404).send({ message: "User Not found." });
        }
  
        var passwordIsValid = bcrypt.compareSync(
          req.body.password,
          account.password
        );
  
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!"
          });
        }
  
        var token = jwt.sign({ id: account.id }, config.secret, {
          expiresIn: 86400 // 24 hours
        });
  
        var authorities = [];
        account.getRoles().then(roles => {
          for (let i = 0; i < roles.length; i++) {
            authorities.push("ROLE_" + roles[i].name.toUpperCase());
          }
          res.status(200).send({
            id: account.id,
            username: account.userName,
            email: account.email,
            roles: authorities,
            accessToken: token
          });
        });
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
  };