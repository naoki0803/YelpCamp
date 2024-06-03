const mongoose = require("mongoose")
const {Schema} = mongoose;


const campgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String, 
    reviews: [
        {
            type: Schema.Types.ObjectID,
            ref: 'Review'
        }
    ]
});



module.exports = mongoose.model("Campground", campgroundSchema); //モデル名は単数系で先頭を大文字にする。第二引数にはスキーマを渡す

