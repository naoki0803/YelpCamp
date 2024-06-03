const mongoose = require('mongoose');
const {Schema} = mongoose;

const reviewSchema = new Schema({
    body: String,
    rating: Numver
});

module.exports = mongoose.model('Revew', reviewSchema);