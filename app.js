const express = require("express"); //要npm i ejs
const app = express();
const axios = require('axios');
require('dotenv').config();  //.env ファイルを読み込むために、dotenv

const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate")

const Campground = require("./models/campground");
const methodOverride = require("method-override");

const catchAsync = require("./utils/catchAsync");
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

app.post("/campgrounds", catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
}));


//詳細ページ
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/show", { campground })
}));

//編集ページ
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", { campground })
}));

app.put("/campgrounds/:id", catchAsync(async (req, res) => {
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

//エラーハンドリング
app.use((err, req, res, next) => {
    res.send("問題がおきました");
});

//サーバ接続
app.listen(3000, () => {
    console.log("サーバーをPort3000で受付中")
})