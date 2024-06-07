const express = require("express"); //要npm i ejs
const app = express();
const axios = require('axios');
require('dotenv').config();  //.env ファイルを読み込むために、dotenv

const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
// const Joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./schemas');

const Campground = require("./models/campground");
const methodOverride = require("method-override");

const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Review = require('./models/review');
const review = require("./models/review");

//'mongodb://127.0.0.1:27017/<DBの場所をここで指定できるので、以下の場合movieAppというディレクトリに保存される>>
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("コネクション成功！！");
    })
    .catch(err => {
        console.log(err);
        console.log("MongoDBコネクションエラー");
    });

//”getpost.ejs"のformからpostされたデータをパースしてくれる記述
//app.postのreq.bodyで中身を確認する為には、送られてくる情報をパースする必要がある
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); //jsonデータをパスしてくれる記述

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(methodOverride("_method"))

const validateCampground = (req, res, next) => {
    // const campgroundSchema = Joi.object({
    //     campground: Joi.object({
    //         title: Joi.string().required(),
    //         price: Joi.number().required().min(0)
    //     }).required()
    // });
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


// Unsplash APIリクエスト用の関数
const fetchRandomImage = async () => {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY; //.env ファイル内の UNSPLASH_ACCESS_KEY の値が取得される
    const apiUrl = `https://api.unsplash.com/photos/random?client_id=${accessKey}&collections=483251`;
    try {
        const response = await axios.get(apiUrl);
        const imageData = response.data;
        // 必要な情報を取得する例
        const imageUrl = imageData.urls.regular;
        return imageUrl
    } catch (error) {
        console.error('Error fetching image:', error.message);
    }
};

app.get("/", async (req, res) => {
    // メインの処理を呼び出す
    const imageUrl = await fetchRandomImage();
    res.render("home", { imageUrl });
});

//一覧ページ
app.get("/campgrounds", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
});


//新規登録ページ
// formからPOSTされる情報を、ejsで扱うようにするためには、以下を実行して値をパースする必要がある。 
// app.use(express.urlencoded({ extended: true })); 
// app.use(express.json()); //jsonデータをパスしてくれる記述
app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new")
});

app.post("/campgrounds", validateCampground, catchAsync(async (req, res) => {
    // if(!req.body.Campgroundf){ throw new ExpressError('不正なキャンプ場のデータです', 400);  }

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));


//詳細ページ
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render("campgrounds/show", { campground })
}));

//編集ページ
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground })
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { useFindAndModify: false })
    res.redirect(`/campgrounds/${campground._id}`);
}));

//削除
app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
}));

app.post("/campgrounds/:id/reviews", validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete(`/campgrounds/:id/reviews/:reviewId`, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    // Review.findById
    res.redirect(`/campgrounds/${id}`)
    res.send('削除', req.body);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError("ページが見つかりませんでした。", 404));
});

//エラーハンドリング
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = '問題が置きました';
    }
    res.status(statusCode).render('error', { err })
});

//サーバ接続
app.listen(3000, () => {
    console.log("サーバーをPort3000で受付中")
})