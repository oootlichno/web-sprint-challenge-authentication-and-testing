const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = require('express').Router();
const { BCRYPT_ROUNDS, JWT_SECRET} = require('../../secrets-index');
const {restricted} = require('../../api/middleware/restricted');
const User = require('../auth/auth-model');

router.get("/users", (req, res, next) => { 
  User.find()
    .then(users => {
      res.json(users);
    })
    .catch(next);
});

router.get("/users/:id",  (req, res, next) => { 
  User.findById(req.params.id)
    .then(user => {
      res.json(user);
    })
    .catch(next);
});


router.post('/register', async (req, res, next) => {
  let { username, password } = req.body;

  if (!username || !password) {
      return res.status(400).json({ message: "username and password required" });
  }

  try {
      const existingUser = await User.findBy({ username });
      if (existingUser) {
          return res.status(400).json({ message: "username taken" });
      }

      const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
      const newUser = { username, password: hash };

      const savedUser = await User.add(newUser);
      console.log("Saved User:", savedUser); 

      if (!savedUser) {
          return res.status(500).json({ message: "Failed to save user" });
      }

      res.status(201).json(savedUser); 
  } catch (error) {
      console.error("Registration error:", error); 
      next(error);
  }
});


router.post('/login', async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "username and password required" });
  }

  try {
    const user = await User.findBy({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = buildToken(user); 
      res.status(200).json({
        message: `welcome, ${user.username}`,
        token,
        
      });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'There was an error during login' });
  }
});

function buildToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };

  const options = {
    expiresIn: '1d',
  };

  return jwt.sign(payload, JWT_SECRET, options);
}



module.exports = router;