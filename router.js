const express = require('express');
const router = express.Router();
const bodyparser = require('body-parser');
const userController = require('./controller/usercontroller')
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const auth=require("./auth");
const fileupload = require('express-fileupload');
require('./auth');
const user = require('./models/user')
router.use(fileupload({
  useTempFiles:true
}));

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name:'' , 
  api_key: '',
  api_secret:'' ,

});

// router.use((req, res, next) => {
//   const { user } = req.session;
//   req.app.locals.isLoggedIn = ( user );
//   req.app.locals.user = user;
//   next();
// });



router.use(cookieParser('secret'));
router.use(session({
     secret:'secret',
     maxAge:3600000,
     resave:true,
     saveUninitialized:true,
}));


router.use(passport.initialize());
router.use(passport.session());


router.use(flash());
router.use(function(req,res,next){
  res.locals.success_message = req.flash('success_message');
  res.locals.error_message = req.flash('error_message');
  res.locals.error = req.flash('error');
   res.locals.currentUser=req.user;///to check current user
   req.app.locals.isLoggedIn = ( user );
  next(); 
});

var dbconnect=require("./db");
dbconnect();


router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

	router.get('/auth/google/callback', 
	  passport.authenticate('google', { successRedirect: '/dashboard',
          
    
    failureRedirect: '/' }));


router.use(bodyparser.urlencoded({extended:true}));

router.get('/', userController.home);
router.post('/login',userController.login);
router.post('/register',userController.register)
router.get('/dashboard',auth.isLoggedIn,userController.dashboard)
router.get('/logout',userController.logout)
router.post('/postdata',auth.isLoggedIn,userController.postdata);
router.get('/getpostdata',auth.isLoggedIn,userController.getpostdata)
router.post('/comment/:id/:comment_id',auth.isLoggedIn,userController.deletecomment);
router.post('/comments/:id',auth.isLoggedIn,userController.addcomments)
router.get('/post/:id',userController.pid);
router.get('/user/:id',userController.uid);


router.get('/friends',auth.isLoggedIn,userController.friends)

router.get('/userprofile/:id',auth.isLoggedIn,userController.userprofiles);
router.post('/edit-profile',auth.isLoggedIn,userController.editdata)
router.post('/like/:id',auth.isLoggedIn,userController.like);
router.post('/unlike/:id',auth.isLoggedIn,userController.unlike);
router.get('/edit-profile',auth.isLoggedIn,userController.editprofile)
router.get('/delete/:id',auth.isLoggedIn,userController.deletepost);
router.get('/profile',auth.isLoggedIn,userController.profile)
router.get('/searchfriend',auth.isLoggedIn,userController.searchfriend)
router.get('/searchfriend/:name',auth.isLoggedIn,userController.searchname);
router.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email,user_photos' }));
router.get('/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/dashboard',
			failureRedirect : '/'
		}));

router.post('/follow',auth.isLoggedIn,userController.follow);
router.get('/chat',auth.isLoggedIn,userController.chat)
var pass=require("./passport");
pass();


module.exports = router;  