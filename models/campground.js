const mongoose = require("mongoose")
const schema = mongoose.Schema;


const campgroundSchema = new schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});



module.exports = mongoose.model("Campground", campgroundSchema); //モデル名は単数系で先頭を大文字にする。第二引数にはスキーマを渡す

