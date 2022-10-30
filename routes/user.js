const router = require('express').Router();
const passport = require('passport');
const passportConfig = require('../config/passport');
const User = require('../models/user');
var _ = require('lodash');
/* SIGNUP ROUTE */
router.route('/signup')

  .get((req, res, next) => {
    res.render('accounts/signup', { message: req.flash('errors')});
  })

  .post((req, res, next) => {
    User.findOne({ email: req.body.email }, function(err, existingUser) {
      if (existingUser) {
        req.flash('errors',  'Account with that email address already exists.');
        return res.redirect('/signup');
      } else {
        var user = new User();
        user.name = req.body.username;
        user.email = req.body.email;
        user.photo = user.gravatar();
        user.password = req.body.password;
        user.save(function(err) {
          if (err) return next(err);
          req.logIn(user, function(err) {
            if (err) return next(err);
            res.redirect('/');
          });
        });
      }
    });
  });


/* LOGIN ROUTE */
router.route('/login')

  .get((req, res, next) => {
    if (req.user) return res.redirect('/');
    res.render('accounts/login', { message: req.flash('loginMessage')});
  })

  .post(passport.authenticate('local-login', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/login', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
  }));

router.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
 }));

 router.get('/auth/google', passport.authenticate('google', { scope: 'email' }));

 router.get('/auth/google/callback', passport.authenticate('google', {
   successRedirect: '/profile',
   failureRedirect: '/login',
   failureFlash: true
  }));


/* PROFILE ROUTE */
router.route('/profile')
  .get(passportConfig.isAuthenticated, (req, res, next) => {
    res.render('accounts/profile', { message: req.flash('success') });
  })
  .post((req, res, next) => {
    User.findOne({ _id: req.user._id }, function(err, user) {
      var languages =[];
      if (user) {
        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.about) user.about = req.body.about;
        if (req.body.college) user.college = req.body.college;
        if (req.body.degree) user.degree = req.body.degree;
        if (req.body.department) user.department = req.body.department;
        if (req.body.year) user.year = req.body.year;
        if (req.body.languages) {
        _.each(req.body.languages,(value,index) => {
          languages.push({'data':req.body.languages[index],'level':req.body.level[index] });
        });
        user.languages = languages;
      }
          user.save(function(err) {
            console.log(err);
            req.flash('success', 'Your details have been updated');
            res.redirect('/profile');
         });
      }
    });
  });



router.get('/logout', (req, res) => {
//  req.logout();
req.session.destroy(function (err) {
  res.redirect('/'); //Inside a callback
});
});

module.exports = router;
