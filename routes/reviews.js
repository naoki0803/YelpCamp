const express = require('express');
const router = express.Router({ mergeParams: true });   //mergeParamsを記載することで、router内でも、req.paramsを受け取る事ができる. 
const reviews = require('../controllers/reviews')
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const catchAsync = require("../utils/catchAsync");

//レビュー作成
router.post("/", validateReview, isLoggedIn, catchAsync(reviews.createReview));

//レビュー削除
router.delete(`/:reviewId`, isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;