const user = require('../models/user');
const bycrpt = require('bcryptjs');
const  passport =require ('passport');
const cloudinary = require('cloudinary').v2;
const Post = require('../models/post')

const socket = require('socket.io');
var moment = require('moment');

var async = require('async');
const { mapReduce } = require('../models/user');

exports.home = function(req, res) {
    res.render('index');
  };


exports.login=function(req,res,next){
    passport.authenticate('local',{
        failureRedirect:'/', 
     successRedirect:'/dashboard',    
      failureFlash:true,
    })(req,res,next);
 };

 
 exports.register = function(req,res){
  var {email , username, password, confirmpassword} = req.body;
  var err;
  var college ='';
  var gender = '';
  var location ='';
  if(!email|| !username || !password || !confirmpassword)
  {
      err = "Please Fill All the Field";
    //  res.re nder('index',{'err':err});

  }

   if(password != confirmpassword)
   {
       err = "Password Don't Match";
      // res.render('index',{'err':err,'email':email, 'username':username})
       }
  
   if(typeof err =='undefined'){
       user.findOne({email:email}, function(err,data){
           if(data)
           {
               console.log("User Exists");
               //err = "User Already Exists With This Email Id";
         //      res.render('index',{'err':err, 'email':email, 'username': username});
           }else{
               bycrpt.genSalt(10,(err,salt)=>{
                   if(err)
                   throw err;
                   bycrpt.hash(password,salt, (err,hash)=>{
                       if(err) throw err;
                       password = hash;
                       user({
                           email,
                           username,
                           password,
                           gender ,
                       location  ,
                       college 
                       }).save((err,data)=>{
                           if(err) throw err;
//                           req.flash('success_message',"Registred Successfully.. Login To Continue");                      
                            res.redirect('/');
                       });
                   })
               })
           }
       })
   }
};

exports.dashboard = function(req,res){
    
     
      Post.find()
      .sort({ date: -1 })
      .then(
    
        posts => res.render('dashboard',{'user' :req.user , posts}) );
   
 
    }

            
 

exports.searchfriend = function(req,res)
    {
      user.find().select('username').then((data)=>{
        res.status(201).json(data)
      
      })

    }

 exports.searchname = function(req,res)
 {
   var regex = new RegExp(req.params.name,'i');
   user.find({name : regex}).then((result)=>{
     res.status(200).json(result);
   })
 }   


 exports.userprofiles = function(req,res)
 {



      user.findById(req.params.id)
      .then(users => res.render('user_profile',{'user' : req.user,users}) )
        
   .catch(err =>
        res.status(404).json({ user: 'No user found' })
       )

       
    

 }

 exports.chat = function(req,res)
 {
   res.render('chat',{'user' : req.user})
 }

 exports.follow = async function(req,res)
 {
  const { follower, following, action } = req.body;
  try {
      switch(action) {
          case 'follow':
              await Promise.all([ 
                  user.findByIdAndUpdate(follower, { $push: { following: following }}),
                  user.findByIdAndUpdate(following, { $push: { followers: follower }})
              
              ]);
          break;

          case 'unfollow':
              await Promise.all([ 
                  user.findByIdAndUpdate(follower, { $pull: { following: following }}),
                  user.findByIdAndUpdate(following, { $pull: { followers: follower }})
              
              ]); 
          break;

          default:
              break;
      }

      res.json({ done: true });
      
  } catch(err) {
      res.json({ done: false });
  }

  
 }



  



 


 exports.deletefriend = async function(req,res)
 {
         
  user.findById(req.user.params).then(user=>{
    if (
      user.friends.filter(
        friend => friends._id.toString() === req.params.friends_id
      ).length === 0
    ) {
      return res
        .status(404)
        .json({ friend: 'friend is not found' });
    }

    // Get remove index
    const removeIndex = user.friends
      .map(item => item._id.toString())
      .indexOf(req.params.friends_id);

    // Splice comment out of array
    user.friends.splice(removeIndex, 1);

    user.save().then(user => res.redirect('/profile'));
  })
  .catch(err => res.status(404).json({ friendnotfound:  'No Freind found' }));
   
  

 }

 









exports.postdata = function(req,res)
{
    const newPost = new Post({
        text: req.body.text,
        name: req.user.username ,
        user: req.user.id ,
        avatar : req.user.avatar 
      });
      
      console.log(req.user);
      newPost.save().then(post => res.redirect('/dashboard'));
    
}


exports.profile = function(req,res)
{

  
 user.findOne({ id: req.user.id })
      .then(profile => {

        Post.find()
    .sort({ date: -1 })
    .then(posts =>
      
    res.render('profile',{'user' : req.user,posts} ))
      })
      .catch(err => res.status(404).json(err));
  }

  


exports.editprofile = function(req,res)
{


  user.findOne({ user: req.user.id })
  .then(profile => {

   

    if (!profile) {
      errors.noprofile = 'There is no profile for this user';
      res.status(404).json(errors);
    }

     res.render('editprofile',{'user' :req.user } );
  })
  .catch(err =>
    res.status(404).json({ user: 'There is no profile for this user' })
  );


}

exports.editdata = function(req,res)
{


  const profileFields = {};
  profileFields.about = req.body.about
  profileFields.college = req.body.college
  profileFields.location =req.body.location

 

    user.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        // Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        ).then(profile => res.redirect('/profile'));
      }

    });

  

}
   
 

exports.friends = function(req,res)
{
  user.findOne({_id : req.user._id}).
  then(profile => 
  res.render('friends',{'user' : req.user}))
  .catch(err =>res.status(404).json(err));


}


exports.getpostdata = function(req,res)
{
  
  Post.find()
  .sort({ date: -1 })
  .then(posts => res.json(posts) )
    

}





exports.deletepost = function(req,res)
{
   
      

  
    user.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          // Check for post owner
          if (post.user.toString() !== req.user.id) {
            return res
              .status(401)
              .json({ notauthorized: 'User not authorized' });
          }

          // Delete
          post.remove().then(() => res.redirect('/dashboard'));
        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
    })
  
 
  
  

      
}

exports.deletecomment = function(req,res)
     {
      Post.findById(req.params.id)
        .then(post => {
          // Check to see if comment exists
          if (
            post.comments.filter(
              comment => comment._id.toString() === req.params.comment_id
            ).length === 0
          ) {
            return res
              .status(404)
              .json({ commentnotexists: 'Comment does not exist' });
          }
  
          // Get remove index
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);
  
          // Splice comment out of array
          post.comments.splice(removeIndex, 1);
  
          post.save().then(post => res.redirect('/dashboard'));
        })
        .catch(err => res.status(404).json({ postnotfound:  'No post found' }));
    }
  

    exports.addcomments = function(req,res)
    {
        
              Post.findById(req.params.id)
                .then(post => {
                  
                  const newComment = {
                    text: req.body.text2,
                    name: req.user.username ,
                    user: req.user.id ,
                    avatar : req.user.avatar 
                  };

                           
                  // Add to comments array
                  post.comments.unshift(newComment);
          
                  // Save
                  post.save().then(post => res.redirect('/dashboard'));
                })
                .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
            
          
    }

    exports.pid = function(req,res)
    {
      
            Post.findById(req.params.id)
              .then(post => res.json(posts))
           .catch(err =>
                res.status(404).json({ nopostfound: 'No post found with that ID' })
               );
          
    }

    exports.uid = function(req,res)
    {
      
            user.findById(req.params.id)
              .then(user => res.json(user))
           .catch(err =>
                res.status(404).json({ user: 'No user found' })
               );
          
    }
       

    exports.like = function(req,res)
    {
      user.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res.redirect('/dashboard')
            }
  
            // Add user id to likes array
            post.likes.unshift({ user: req.user.id });
  
            post.save().then(post => res.redirect('/dashboard'));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
      
    }

 exports.unlike = function(req,res)
 {
  user.findOne({ user: req.user.id }).then(profile => {
    Post.findById(req.params.id)
      .then(post => {
        if (
          post.likes.filter(like => like.user.toString() === req.user.id)
            .length === 0
        ) {
          return res
            .status(400)
            .json({ notliked: 'You have not yet liked this post' });
        }

        // Get remove index
        const removeIndex = post.likes
          .map(item => item.user.toString())
          .indexOf(req.user.id);

        // Splice out of array
        post.likes.splice(removeIndex, 1);

        // Save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
  });
  
 }

exports.logout = function(req,res)
{
    req.logout();
    res.redirect('/')
}

