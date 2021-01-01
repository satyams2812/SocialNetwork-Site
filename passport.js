const LocalStrategy = require('passport-local').Strategy;
const bycrypt = require('bcryptjs');

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('./models/user');
const passport = require('passport');
const facebookStrategy = require('passport-facebook').Strategy


module.exports = function(passporta){
    passport.use(
        new LocalStrategy ({usernameField : 'email'},(email,password,done)=>{
            // Match User
            User.findOne({email : email }).then(user =>{
                if(!user)
                {
                    return done(null, false,{message : "this email is not register"});

                }
                //match password
                bycrypt.compare(password,user.password,(err,isMatch)=>{
                    if(err) throw err;

                    if(isMatch )
                    {
                        return done(null,user);

                    }else{
                        return done(null,false,{message : "password incorrect"});
                    }
                });
            })  
            .catch(err =>{
                console.log(err);
            });
        })

        
    );

    passport.use(new GoogleStrategy({
	    clientID: '',
	    clientSecret: '',
        callbackURL: ''
    
	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		User.findOne({'email': profile.emails[0].value}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {

                        var newUser = new User();
                       
	    			
	    				newUser.username = profile.displayName;
	    				newUser.email = profile.emails[0].value;
                        newUser.avatar = profile.photos[0].value;
                        newUser.gender = '';
                        newUser.location = '';
                        newUser.college = '';
                        

	    				newUser.save(function(err){
	    					if(err)
	    						throw err;
	    					return done(null, newUser);
	    				});
	    				console.log(profile);
	    			}
	    		});
	    	});
        }
        

       


    ));

    

    passport.use(new facebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID        : "",
        clientSecret    : "",
        callbackURL     : "",
        profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']
    
    },// facebook will send back the token and profile
    function(token, refreshToken, profile, done) {
    
        // asynchronous
        process.nextTick(function() {
    
            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
    
                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);
    
                // if the user is found, then log them in
                if (user) {
                    console.log("user found")
                    console.log(user)
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user found with that facebook id, create them
                    var newUser = new User();
    
                    // set all of the facebook information in our user model
                    newUser.id    = profile.id; // set the users facebook id                   
                   // we will save the token that facebook provides to the user                    
                    newUser.username  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.gender = profile.gender
                    newUser.avatar = profile.photos[0].value
                    // newUser.email = profile.emails[0].value
                   newUser.gender = '';
                        newUser.location = '';
                        newUser.college = '';
                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
    
                        // if successful, return the new user
                        return done(null, newUser);
                    });
                    console.log(profile);

                }
    
            });
    
        })
    
    }));
    



   


passport.serializeUser(function(user,done){
    done(null,user.id);
});

passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        done(err,user);
    });
});
};

