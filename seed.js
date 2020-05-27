var mongoode=require("mongoose");
var Champground= require("./models/champground");
var Comment =require("./models/comment");

var data=[
    {
        name:"cloudy one",
        image:"https://icdn7.digitaltrends.com/image/digitaltrends/coleman-red-canyon-8-prd-1079x720.jpg",
        description:"Hiking the Appalachian Trail in Pennsylvania for a week in…2006 and my brother and I came across a young man who had hung himself. We sprinted up to the bluff where he was strung up. I wrapped my arms around his waist to take weight off his neck while my brother cut him down with his Leatherman. He had thrown the rope up over a tall branch and lashed it off with a clove hitch at the trunk like you’d hang a bear-bag. Must’ve climbed the branches and dropped once laced in. We probably shouldn’t have even tried, he was dead for sometime before we happened across him. Fortunately no critters had come to tear him apart before we found him, it would’ve only gotten grislier from there. Called 911. Ended our trip pretty damn quick." 
    },
    {
        name:"luxry one",
        image:"https://mk0asherfergussgajut.kinstacdn.com/wp-content/uploads/2018/10/camping-under-the-stars.jpg",
        description:"Hiking the Appalachian Trail in Pennsylvania for a week in…2006 and my brother and I came across a young man who had hung himself. We sprinted up to the bluff where he was strung up. I wrapped my arms around his waist to take weight off his neck while my brother cut him down with his Leatherman. He had thrown the rope up over a tall branch and lashed it off with a clove hitch at the trunk like you’d hang a bear-bag. Must’ve climbed the branches and dropped once laced in. We probably shouldn’t have even tried, he was dead for sometime before we happened across him. Fortunately no critters had come to tear him apart before we found him, it would’ve only gotten grislier from there. Called 911. Ended our trip pretty damn quick." 
    },
    {
        name:"manali one",
        image:"https://v7c5h6e9.rocketcdn.me/wp-content/uploads/2018/07/The-5-Best-Camping-Tents-in-India-February-2020-%E2%80%93-Reviews-Buying-Guide-1024x576.jpg",
        description:"Hiking the Appalachian Trail in Pennsylvania for a week in…2006 and my brother and I came across a young man who had hung himself. We sprinted up to the bluff where he was strung up. I wrapped my arms around his waist to take weight off his neck while my brother cut him down with his Leatherman. He had thrown the rope up over a tall branch and lashed it off with a clove hitch at the trunk like you’d hang a bear-bag. Must’ve climbed the branches and dropped once laced in. We probably shouldn’t have even tried, he was dead for sometime before we happened across him. Fortunately no critters had come to tear him apart before we found him, it would’ve only gotten grislier from there. Called 911. Ended our trip pretty damn quick." 
    },
]

function seedDB(){
    //remove all champground
    Champground.remove({},function(err){
        if(err){
            console.log("err")
        }
        console.log("remove ground");
        //create some champground
        data.forEach(function(seed){
            Champground.create(seed,function(err,champground){
                if(err){
                    console.log("err");
                }
                else{
                    console.log("added a champ ground");
                    Comment.create(
                        { 
                            text:"this place is greate but i wish internet should be their",
                            author:"Homer"
                        },function(err,comment){
                            if(err){
                                console.log(err);
                            }
                            else{
                                champground.comments.push(comment);
                                champground.save();
                                console.log("created new comment");
                            }
                        });
                }
            });
        });
    });
    
}

module.exports = seedDB;