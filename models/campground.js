const { func, string } = require("joi");
const mongoose = require("mongoose")
mongoose.set('useFindAndModify', false);

const { Schema } = mongoose;
const Review = require('./review');


const campgroundSchema = new Schema({
    title: String,
    // image: String,  //cloudinaryに対応させる為コメントアウト
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectID,
            ref: 'Review'
        }
    ]
});

campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        }
        )
    }


})


module.exports = mongoose.model("Campground", campgroundSchema); //モデル名は単数系で先頭を大文字にする。第二引数にはスキーマを渡す

