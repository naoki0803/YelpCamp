const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const {Schema} = mongoose;

const reviewSchema = new Schema({
    body: String,
    raiting: Number
});

module.exports = mongoose.model('Review', reviewSchema);