//jshint esversion:6

//using passport so cookie remembers they are logged in for the length of browser session
//I use lots of different versions so lots of commenting out there is a github woth commits
//for each stage at https://github.com/londonappbrewery/Authentication-Secrets

//this can be used to protect awskeys ... when on github .. it should be at the top
require("dotenv").config();

// const bcrypt = require("bcrypt");
// const saltRounds =10;
// const md5=require("md5");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose =require("mongoose");
// const encrypt=require("mongoose-encryption");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
//find or create was pseudo code of google saying put a find or create function in
//but someone has made a node module of it so that you can just add it and the pseudo
//becomes code
const findOrCreate=require("mongoose-findorcreate");
const app = express();



app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret:"Our little secret.",
  resave:false,
  saveUninitialized:false

}));



app.use(passport.initialize());
app.use(passport.session());


//need to replace password with my phy5prtAdmin password for now putting in a file excluded from git
var password;
fs.readFile("ignoreMePasswords.txt", function(err, buf) {

  password=buf.toString().trim();
  mongoose.connect("mongodb+srv://phy5prtAdmin:"+password+"@cluster0-su305.mongodb.net/secretsDB", {useNewUrlParser:true});
  //mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

});
mongoose.set("useCreateIndex", true);



const userSchema= new mongoose.Schema({
email:String,
password:String,
googleId:String,
secret:String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

//putting in .env so wouldnt be seen on github
//obvs dont just comment it out and leave it below either
// const secret = "Thisisourlittlesecret.";
// userSchema.plugin(encrypt, {secret:process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(function(user,done){
  done(null,user.id);
});

passport.deserializeUser(function(id,done){
  User.findById(id, function(err, user){
    done(err,user);
  });
});

//this is a simpler way to work with google need the broader way
//that allows more approaches to logging in
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret:process.env.CLIENT_SECRET,
  callbackURL:"http://localhost:3000/auth/google/secrets",
  userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb){
  User.findOrCreate({googleId: profile.id}, function(err,user){
    return cb(err,user);
  });
}
));

app.get("/", function(req,res){
  res.render("home");
});

app.get("/auth/google",
  passport.authenticate("google",{scope:["profile"]
})
);

app.get("/auth/google/secrets",
passport.authenticate("google",{failureRedirect: "/login" }),
function(req,res){
  res.redirect("/secrets");
});


app.get("/login", function(req,res){
  res.render("login");
});

app.get("/register", function(req,res){
  res.render("register");
});

app.get("/secrets", function(req,res){

User.find({"secret":{$ne:null}}, function(err,foundUsers){
  if(err){console.log(err);
  }else{
    if(foundUsers){
      res.render("secrets",{usersWithSecrets:foundUsers});
    }
  }
});
  //no longer uses authentification
  // if(req.isAuthenticated()){res.render("secrets");}else{
  //   res.redirect("/login");
  // }
});

app.get("/submit", function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");}else{res.redirect("/login");

  }
});

app.post("/submit", function(req,res){
  const submittedSecret = req.body.secret;
  User.findById(req.user.id, function(err, foundUser){
    if(err)
    {

    }else{
      if(foundUser){
        foundUser.secret=submittedSecret;
        foundUser.save(function(){
          res.redirect("/secrets");
        });
      }
    }
  });


});

app.get("/logout", function(req,res){
  req.logout();
res.redirect("/");
});

app.post("/register", function(req, res){

User.register({username:req.body.username}, req.body.password, function(err, user){

  if(err){console.log(err);
  res.redirect("/register");
}else{
  passport.authenticate("local")(req,res, function(){
    res.redirect("/secrets");
  });
}
});



  // bcrypt.hash(req.body.password, saltRounds, function(err, hash){
  //   const newUser = new User({
  //     email: req.body.username,
  //     password:hash
  //                             });
// newUser.save(function(err){
//   if(err){console.log(err);
//   }else{
//     res.render("secrets");
//   }
//                             });
//                           });
                        });
                        // const newUser = new User({
                        //   email: req.body.username,
                        //   password:md5(req.body.password)});

app.post("/login", function(req,res){

const user = new User({
username:req.body.username,
password:req.body.password

});

req.login(user,function(err){
if(err){
  console.log(err);
}else{passport.authenticate("local")(req,res, function(){res.redirect("/secrets");});
}

});

// const username = req.body.username;
// const password = req.body.password;
// const password = md5(req.body.password);

//bycrypt
// User.findOne({email:username}, function(err, foundUser){
//   if(err){console.log(err);
//   }else{
//     if(foundUser){
//       // if(foundUser.password===password){
// bcrypt.compare(password,foundUser.password, function(err,result){
//   if(result === true){
//         res.render("secrets");
//   }
// });
//
//       }
//     }
//   });
});



app.listen(3000,function(){
  console.log("Server started on port 3000.");
});
