const express = require('express');
const router = express.Router({ mergeParams: true });   //mergeParamsを記載することで、router内でも、req.paramsを受け取る事ができる. 
const { validateReview } = require('../middleware');
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const Review = require('../models/review');


router.post("/", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'レビューを登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete(`/:reviewId`, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'レビューを削除しました');
    // Review.findById
    res.redirect(`/campgrounds/${id}`)
    // res.send('削除', req.body);
}))


module.exports = router;