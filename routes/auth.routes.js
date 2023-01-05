const bcryptjs = require("bcryptjs");
const User = require("../models/User.model");
const router = require("express").Router();


const saltRounds = 10;

//signup:display form
router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
});

//signup:process form
router.post("/signup", (req, res, next) => {
    const {password, email} = req.body;

    bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hash => {
      return User.create({       
        email,       
        passwordHash: hash
      });
    })
    .then(userFromDB => {
      console.log('Newly created user is: ', userFromDB);
      res.redirect("/");
    })
    .catch(e => {
        console.log("error creating user account",e)
        next(e)
    });
});


//login:display form
router.get("/login", (req, res, next) => {
    res.render("auth/login");
});

//login:process form
router.post("/login", (req, res, next) => {
    const {password, email} = req.body;

    if (!email || !password) {
        res.render('auth/login', { errorMessage: 'All fields are mandatory. Please provide your email and password to login.' });
        return;
      }

    User.findOne({ email: email })
        .then(userFromDB => {
            if (!userFromDB) {
                //user does not  exist
                res.render('auth/login', { errorMessage: 'Email is not registered. Try with other email.' });
                return;
            } else if (bcryptjs.compareSync(password, userFromDB.passwordHash)) {
                //login successfully
                req.session.currentUser = userFromDB;                
                res.redirect("/user-profile");
            } else {
                //login failed
                res.render('auth/login', { errorMessage: 'Incorrect password.' });
            }
        })
        .catch(error => console.log("Error getting user details from DB", error));

});

//User Profile
router.get("/user-profile", (req, res) => {
    res.render("users/user-profile", {userInsession: req.session.currentUser});    
});

//Logout
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {    
      if (err) next(err);
      res.redirect('/');
    });
  });

module.exports = router;