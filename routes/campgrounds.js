const express = require('express');
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');

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
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    console.log(campground);
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { campground })
}));

//編集ページ
router.get("/:id/edit", isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした');
        res.redirect('/campgrounds')

    }
    res.render("campgrounds/edit", { campground })
}));

router.put("/:id", isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { useFindAndModify: false })
    req.flash('success', 'キャンプ場を更新しました');
    res.redirect(`/campgrounds/${campground._id}`);
}));

//削除
router.delete("/:id", isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました');
    res.redirect("/campgrounds");
}));

module.exports = router;