const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');


//一覧ページ 
router.get("/", async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
});


//新規登録ページ
// formからPOSTされる情報を、ejsで扱うようにするためには、以下を実行して値をパースする必要がある。  
// app.use(express.urlencoded({ extended: true })); 
// app.use(express.json()); //jsonデータをパスしてくれる記述
router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new")
});

router.post("/", isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    // if(!req.body.Campgroundf){ throw new ExpressError('不正なキャンプ場のデータです', 400);  } 
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', '新しいキャンプ場を登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
}));


//詳細ページ
router.get("/:id", catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    // .populate('reviews')
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    .populate('author');
    // console.log(campground);
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
}));

//編集ページ
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        res.redirect('/campgrounds')
    }

    // isAuthorとして別定義した為以下コメントアウト
    // // campgroundを作成したユーザーと、ログインしているuserが不一致の場合、更新不可
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('error', '更新する権限がありません');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    res.render("campgrounds/edit", { campground })
}));

router.put("/:id", isLoggedIn, isAuthor, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;

    // // isAuthorとして別定義した為以下コメントアウト
    // // mongoose.Types.ObjectId(id)は、文字列として与えられたidをMongoDBのObjectId型に変換します。
    // //MongoDBのIDは通常、ObjectId型の12バイトのバイナリデータです。この変換が必要なのは、検索のために正しいデータ型を確保するためです。
    // // const campground = await Campground.findById(mongoose.Types.ObjectId(id));
    // const campground = await Campground.findById(id);
    // // console.log("id:", id, "typeof:", typeof(id));                                                      //idはstringで定義されている            
    // // console.log("mongoose.Types.ObjectId(id):", mongoose.Types.ObjectId(id)), "typeof:", typeof(mongoose.Types.ObjectId(id)));   //mongoose.Types.ObjectId(id)でMongoDBのObjectId型に変換
    // // mongoose.Types.ObjectId(id)で記述しないとエラーになっていたが、なぜか自然解消(mongooseが起動してなかったとか？？)なので、通常のidで取得するように変更

    // //campgroundを作成したユーザーと、ログインしているuserが不一致の場合、更新不可
    // if (!campground.author.equals(req.user._id)) {
    //     req.flash('error', '更新する権限がありません');
    //     return res.redirect(`/campgrounds/${id}`);
    // }
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { useFindAndModify: false })
    req.flash('success', 'キャンプ場を更新しました');
    res.redirect(`/campgrounds/${camp._id}`);
}));

//削除
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました');
    res.redirect("/campgrounds");
}));

module.exports = router;