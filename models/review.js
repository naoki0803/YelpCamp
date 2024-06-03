const mongoose = require('mongoose');
const {Schema} = mongoose;

const reviewSchema = new Svhema({
    body: String,
    rating: Numver
});

module.exports = mongoose.model('Revew', reviewSchema);