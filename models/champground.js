var mongoose=  require("mongoose");

//SCHEMA setup
var champgroundSchema= new mongoose.Schema({
    name: String,
    image: String,
    description: String,
    author:{
            id:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
                },
                username:String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }
    ]
});

//setupsvhema to a model
module.exports = mongoose.model("champground",champgroundSchema);