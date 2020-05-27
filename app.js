var express       =require("express"),
    app           =express(),
    bodyparser    =require("body-parser"),
    mongoose      =require("mongoose"),
    passport      =require("passport"),
    Localstrategy =require("passport-local"),
    champground   =require("./models/champground"),
    methodoverride=require("method-override"),
    flash         =require("connect-flash"),
    comment       =require("./models/comment"),
    User          =require("./models/user"),
    seedDB        =require("./seed");

console.log(process.env.DATABASEURL);
mongoose.connect("mongodb://localhost/yelp_champ_v11");
//mongodb+srv://yelp:Password1@yelp-lsauu.mongodb.net/test?retryWrites=true&w=majority
//mongodb://localhost/yelp_champ_v11


app.use(bodyparser.urlencoded({extended: true}));
app.set("view engine","ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodoverride("_method"));
app.use(flash());

//creating new champf=ground every time for test and make proper work
//seedDB();  //seed the database

//passport configuration
app.use(require("express-session")({
    secret:"Rusty is the best and cuttest dog in world",
    resave:false,
    saveUninitialized:false
 }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new Localstrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 
app.use(function(req,res,next){
    res.locals.currentUser=req.user;
    res.locals.error    =req.flash("error");
    res.locals.success   =req.flash("success");
    next();
});


//=================
app.get("/",function(req,res){

    console.log("request for landing page");
    res.render("landing");
});
app.get("/champgrounds",function(req,res){
    //Get all champgrounf from DB
    console.log("request for champground page");
    champground.find({},function(err,allchampground){
        if(err){
            console.log("something went wrong");
        }else{
            res.render("champgrounds/index",{champground:allchampground});
        }
    });
    
});
//create the new champground route
app.post("/champgrounds",isLoggedIn,function(req,res){
    //excess data from the form
    var name=req.body.name;
    var image=req.body.image;
    var description=req.body.description;
    var author={
        id: req.user._id,
        username:req.user.username
    }
    var newchampg={name: name , image: image ,description: description,author : author};
    //add data to data base
    champground.create(newchampg,function(err,champground){
        if(err){
            console.log(err);
        }else{
            //console.log("Newly created  champ ground:   ");
            //console.log(champground);
            //redirect the champground page
            res.redirect("/champgrounds");
        }
    });
    
});
//new show form to create new champground
app.get("/champgrounds/new",isLoggedIn,function(req,res){
    res.render("champgrounds/new.ejs");
    console.log("Request for form page to add data!!");
});


//show rout description of a particular object in brief
app.get("/champgrounds/:id",function(req,res){
    //find the champground with provide id
    champground.findById(req.params.id).populate("comments").exec(function(err,foundchampground){
        if(err){
            console.log("something went wrong");
            console.log(err);
        }else{
            //render show tempelate with that id
            res.render("champgrounds/show.ejs",{champground:foundchampground});
        }
    });
    
});

//=================================
//edit and update champground route
//==================================

//edit champground route
app.get("/champgrounds/:id/edit",checkChampgroundOwnership,function(req,res){
            champground.findById(req.params.id,function(err,foundChampground){
                res.render("champgrounds/edit",{champground:foundChampground});
            });
        });

//update champgroundroute
app.put("/champgrounds/:id",checkChampgroundOwnership,function(req,res){
    //find and update the correct champ ground and redirect
    champground.findByIdAndUpdate(req.params.id,req.body.champground,function(err,updatedchampground){
        if(err){
            res.redirect("/champgrounds");
        }else{
            res.redirect("/champgrounds/"+req.params.id);
        }
    })
});

//destroy champground
app.delete("/champgrounds/:id",checkChampgroundOwnership,function(req,res){
    //res.send("you are trying to delet it"); 
    champground.findByIdAndRemove(req.params.id, function(err,){
        if(err){
            res.redirect("/champgrounds");
        }else{
            res.redirect("/champgrounds");
        }
    });
});


//=============================================================
//comment routes
//==============================================================

app.get("/champgrounds/:id/comments/new",isLoggedIn,function(req,res){
    champground.findById(req.params.id ,function(err,champground){
        if(err){
            console.log("something went wrong");
        }else{
            res.render("comments/new",{champground:champground});
        }
    });
});

app.post("/champgrounds/:id/comments",isLoggedIn,function(req,res){
    champground.findById(req.params.id,function(err,champground){
        if(err){
            console.log(err);
            res.redirect("/champgrounds");
        }else{
            comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error","Something went wrong,Try again!!");
                    console.log(err);
                }else{
                    //add user name and id
                    comment.author.username=req.user.username;
                    comment.author.id=req.user._id;
                    comment.save();

                    champground.comments.push(comment);
                    champground.save();
                    console.log(comment);
                    req.flash("success","Successfully added Comment");
                    res.redirect("/champgrounds/"+champground._id);
                }
            })
            
        }
    });
});

//=============================================
//comment delet and edit route
//=============================================
//comment form display
app.get("/champgrounds/:id/comments/:comment_id/edit",checkCommentOwnership,function(req,res){
    comment.findById(req.params.comment_id,function(err,foundcomment){
        if(err){
            res.redirect("back");
        }else{
            res.render("comments/edit",{champground_id : req.params.id,comment:foundcomment});
        }
    })
    
});
//comment put request
app.put("/champgrounds/:id/comments/:comment_id",checkCommentOwnership,function(req,res){
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err,updatedcomment){
        if(err){
            req.flash("error","Something went wrong,Try again!!");
            res.redirect("back");
        }else{
            res.redirect("/champgrounds/"+req.params.id);
        }
    });
});
//comment delet
app.delete("/champgrounds/:id/comments/:comment_id",checkCommentOwnership,function(req,res){
    //find by id and remove
    comment.findByIdAndRemove(req.params.comment_id,function(err){
        if(err){
            res.redirect("back");
        }else{
            req.flash("success","Comment deleted");
            res.redirect("/champgrounds/"+req.params.id);
        }
    });
});

//==============================================
//AUTH routes
//==============================================

//show register form
app.get("/register",function(req,res){
    res.render("register");
});

//responsible for user singup logic
app.post("/register",function(req,res){
    var newUser= new User ({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
            req.flash("success","Welcome to Yelpcamp "+user.username);
            res.redirect("/champgrounds");
        });
    });
});

//show login form
app.get("/login",function(req,res){
    res.render("login");
});
//login logic
//app.post("/ogin",middleware,callback)
app.post("/login",passport.authenticate("local",{
   successRedirect:"/champgrounds",
   failureRedirect:"/login"
}),function(req,res){

});

//logout
app.get("/logout",function(req,res){
    req.logOut();
    req.flash("success","Logged you out!!")
    res.redirect("/champgrounds");
});

//====================================
//isloggedin check
//====================================
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
        //console.log(User);
    }
    //console.log();
    req.flash("error","You need to be logged in to do that");
    res.redirect("/login");
};

//function check the champground belongs to owner??
function checkChampgroundOwnership(req,res,next){
    if(req.isAuthenticated()){
        champground.findById(req.params.id,function(err,foundChampground){
            if(err){
                res.redirect("back");
            }else{
                //does the user owned champground
                if(foundChampground.author.id.equals(req.user._id)){
                    next();
                }
                //otherwise redirect
                else{
                    req.flash("error","You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You dont have permission to do that");
        res.redirect("back");
    }
}

//check comment ownership
function checkCommentOwnership(req,res,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id,function(err,foundComment){
            if(err){
                req.flash("error","Champground not found");
                res.redirect("back");
            }else{
                //does the user owned comment
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                }
                //otherwise redirect
                else{
                    req.flash("error","You dont have permission to do that");
                    res.redirect("back");
                }
            }
        });
    }else{
        req.flash("error","You need to be login to do that");
        res.redirect("back");
    }
}


app.listen(process.env.PORT || 3000 ,function(){
    console.log("champ server has allready started!!");
});