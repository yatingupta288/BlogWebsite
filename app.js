// require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const ejs = require("ejs");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
//  const bcrypt = require("bcrypt");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
  secret: "something that is secret",
  resave : false,
  saveUninitialized: false,
}))
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb+srv://admin-yatin:Test123@cluster0.qhe83.mongodb.net/blogDb2", {useNewUrlParser : true});
// mongodb+srv://admin-yatin:Test123@cluster0.qhe83.mongodb.net/blogDb2
const postSchema = new mongoose.Schema({
  title: String,
  content: String
});

const userSchema = new mongoose.Schema({
  name : String,
  password : String
});

userSchema.plugin(passportLocalMongoose);

const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
  res.render("login");
})

app.get("/register", function(req, res){
  res.render("register");
})

app.post("/register", function(req, res){
  User.register({username : req.body.username }, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
          res.redirect("/home");
      });
    }
  })
    // bcrypt.hash(req.body.password, 10, function(err, hash) {   
    //   const userName = new User({
    //     name: req.body.username,
    //     password : hash
    //   });
    //   userName.save(function(err){
    //     if(err){
    //       console.log(err);
    //     }else{
    //       res.redirect("/");
    //     }
    //   })
    // });
});

app.post("/login", passport.authenticate("local"), function(req, res){
    res.redirect("/home");
    // const user = req.body.username;
    // const pass = req.body.password;
    // User.findOne({username: user}, function(err, foundUser){
    //   if(err){
    //     console.log(err);
    //   }else{
    //     if(foundUser){
    //       bcrypt.compare(pass, foundUser.password, function(err, result) {
    //         // result == true
    //         if(result){
    //           res.redirect("/home");
    //         }
    //     });
    //     }
    //   }
    // });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/home", function(req, res){
  if(req.isAuthenticated()){
    Post.find({}, function(err, posts){
        res.render("home", {homeStartContent: homeStartingContent, posts : posts});
    });
  }else{
    res.redirect("/");
  }
})

app.get("/about", function(req, res){
  if(req.isAuthenticated()){
    res.render("about", {aboutcontent : aboutContent});
  }else{
    res.redirect("/");
  }
})

app.get("/contact", function(req, res){
  if(req.isAuthenticated()){
    res.render("contact", {contactcontent : contactContent});
  }else{
    res.redirect("/");
  }
})

app.get("/compose", function(req, res){
  if(req.isAuthenticated()){
    res.render("compose");
  }else{
    res.redirect("/");
  }
})

app.post("/compose", function(req, res){
    const post = new Post({
      title : req.body.title,
      content : req.body.post
    });
    post.save(function(err){
      if(!err){
        res.redirect("/home");
      }
    });
});

app.get("/post/:postId", function(req, res){
  const requestedPost = req.params.postId;
  Post.findOne({ _id : requestedPost}, function(err, post){
      res.render("post", {title : post.title, content : post.content});
  });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started Succesfully");
});
