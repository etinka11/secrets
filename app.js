require('dotenv').config(); // dotenv must be require above all packages, if not - it won't work
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
var encrypt = require('mongoose-encryption');
const app = express();
//var md5 = require('md5');
const bcrypt = require('bcrypt');
const saltRounds = 10;


main().catch(err => console.log(err));
async function main() {
  //await mongoose.connect('mongodb://localhost:27017/todolistDB'); - were used to connect on our local host only with "mongod"(mongoDB shell)
  await mongoose.connect('mongodb+srv://admin-eteri:123@cluster0.k2pzf.mongodb.net/userDB?retryWrites=true&w=majority'); //connects to mongodb Atlas
}

app.use(express.static('public')); //getting access to public files - you can see more details in app.js inside the folder "newsletter-signup"
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const userSchema = new mongoose.Schema ({ //this is mongoose schema to hide the password
email: String,
password: String
});

//const secret = "Thisisasecret"; //It's very inportant to write this line of code above the "const User" we created below
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'], excludeFromEncryption:  ['email'] }); //this line encrypts our passwords only. lecture 380

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
  res.render("home");
});

app.get("/login", function(req, res){
  res.render("login");
});

app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  
  bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    const newUser = new User({
      email: req.body.username, //getting the data from our HTML page - from the FORM
      password: hash 
    });
  
    newUser.save(function(err){
      if (err){
        console.log(err);
      } else {
        res.render("secrets");
      }
    });
});
  
});

app.post("/login", function(req, res){
/*
after we register to our secret website(and we stored the data with mongoDB atlas),
we want to login.

now when we'll type our username and password, the code
below will check if it matches to our saved "user data"(username & password) on mongoDB, and if
it does, the response from the server will be our secret page.

*/

  const username = req.body.username; //getting the typed username from the form
  const password = req.body.password; //getting the typed password from the form

  User.findOne({email: username}, function(err, foundUser){ //checking the typed usrname against our "users data base", and asking to "find" it.
    if (err){
      console.log(err);
    } else {
      if (foundUser) {

        bcrypt.compare(password, foundUser.password, function(err, result) {
          //this "bcrypt.compare" method will take the "password" the user typed in the login page and compare it with the "foundUser.password" from our database.

            if (result === true){ //if after the comparetion the result is true .aka the same, then render the secrets page.
            res.render("secrets"); //pay attention: only after we logged in with exists user, the secrets page will appear.
          }
      });
       
      }
    }
  });
});

app.listen(3000, function(){
  console.log(`Server started on port 3000`);
});
