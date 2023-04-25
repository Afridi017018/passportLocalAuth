const express = require("express")
const cors = require("cors")
const session = require("express-session")
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy

const app = express()


///db 
mongoose.connect("mongodb+srv://1234:1234@cluster0.x606k.mongodb.net/authInfo")
.then(()=>{
    console.log("hurrah db connected")
})
.catch((err)=>{
    console.log(err)
})
const userSchema = mongoose.Schema({
    username: String,
    password:String
})

const User = mongoose.model("regInfo",userSchema);

///

app.use(express.json())
app.use(cors())


app.use(session({
    secret: 'keyboard cat',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false,maxAge: 60000}
}))

app.use(passport.initialize())
app.use(passport.session())

passport.use(new LocalStrategy(
    function(username, password, done) {
      
      User.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false);
          }
          if (user.password !== password) {
            return done(null, false);
          }
          
          return done(null, user);
        })
        .catch((err) => {
          return done(err);
        });
    }
  ));
  

  passport.serializeUser((user,done)=>{

    if(user){  
        
        return done(null,user.id)
    }
    return done(null,false)
  })


  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then((user) => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch((error) => {
        return done(error);
      });
  });
  




app.get("/",(req,res)=>{

  res.send("This is home")
 
})


///middleware auth function
const isAuthenticated= (req,res,next)=>{
  if(req.user){
    return next();
  }
  return res.redirect("/")
}



app.get("/test",isAuthenticated,(req,res)=>{
    req.session.test ? req.session.test++ : req.session.test = 1;
    console.log(req.session)

    res.send("Welcome to test "+req.session.test.toString())
})




app.post('/login', passport.authenticate('local', { 
    successRedirect: "/",
    failureRedirect: '/login' })

);


app.post("/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      console.log(err);
      return next(err);
    }
    res.send("Logged Out!");
  });

});





module.exports = app;