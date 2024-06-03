const mongoose = require('mongoose');
const {Schema} = mongoose;

const reviewSchema = new Schema({
    body: String,
    raiting: Number
});

module.exports = mongoose.model('Review', reviewSchema);