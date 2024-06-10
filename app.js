const express = require("express"); //要npm i ejs
const app = express();
const axios = require('axios');
require('dotenv').config();  //.env ファイルを読み込むために、dotenv

const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const Joi = require('joi');
const ExpressError = require("./utils/ExpressError");

const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

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

//HomePege
app.get("/", async (req, res) => {
    // メインの処理を呼び出す
    const imageUrl = await fetchRandomImage();
    res.render("home", { imageUrl });
});

//router
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);  //:idがあっても、reviews.jsでrouterを定義する際の引数にmergeParamsをtrueで記載が必要 

//
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