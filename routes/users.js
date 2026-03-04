var express = require('express');
var router = express.Router();
let { dataRole, dataUser } = require('../utils/data2');
let { getItemById } = require('../utils/idHandler');

// GET all users
router.get('/', function (req, res, next) {
  let result = dataUser.filter(function (e) {
    return !e.isDeleted;
  });
  res.send(result);
});

// GET user by username
router.get('/:username', function (req, res, next) {
  let username = req.params.username;
  let result = dataUser.filter(function (e) {
    return e.username == username && !e.isDeleted;
  });
  if (result.length) {
    res.send(result[0]);
  } else {
    res.status(404).send({
      message: "USERNAME NOT FOUND"
    });
  }
});

// POST create new user
router.post('/', function (req, res, next) {
  // Check if username already exists
  let existing = dataUser.filter(function (e) {
    return e.username == req.body.username && !e.isDeleted;
  });
  if (existing.length) {
    res.status(400).send({
      message: "USERNAME ALREADY EXISTS"
    });
    return;
  }

  // Validate role
  let getRole = getItemById(req.body.role, dataRole);
  if (!getRole) {
    res.status(404).send({
      message: "ROLE ID NOT FOUND"
    });
    return;
  }

  let newUser = {
    username: req.body.username,
    password: req.body.password,
    email: req.body.email,
    fullName: req.body.fullName,
    avatarUrl: req.body.avatarUrl || "https://i.sstatic.net/l60Hf.png",
    status: true,
    loginCount: 0,
    role: getRole,
    creationAt: new Date(Date.now()),
    updatedAt: new Date(Date.now())
  };
  dataUser.push(newUser);
  res.send(newUser);
});

// PUT update user
router.put('/:username', function (req, res, next) {
  let username = req.params.username;
  let result = dataUser.filter(function (e) {
    return e.username == username && !e.isDeleted;
  });
  if (result.length) {
    result = result[0];
    let keys = Object.keys(req.body);
    for (const key of keys) {
      if (key == 'role') {
        let getRole = getItemById(req.body.role, dataRole);
        if (!getRole) {
          res.status(404).send({
            message: "ROLE ID NOT FOUND"
          });
          return;
        }
        result.role = getRole;
        continue;
      }
      if (result[key] !== undefined) {
        result[key] = req.body[key];
        result.updatedAt = new Date(Date.now());
      }
    }
    res.send(result);
  } else {
    res.status(404).send({
      message: "USERNAME NOT FOUND"
    });
  }
});

// DELETE user (soft delete)
router.delete('/:username', function (req, res, next) {
  let username = req.params.username;
  let result = dataUser.filter(function (e) {
    return e.username == username && !e.isDeleted;
  });
  if (result.length) {
    result = result[0];
    result.isDeleted = true;
    result.updatedAt = new Date(Date.now());
    res.send(result);
  } else {
    res.status(404).send({
      message: "USERNAME NOT FOUND"
    });
  }
});

module.exports = router;
