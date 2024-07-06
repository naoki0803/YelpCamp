const Campground = require("../models/campground");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapboxToken })
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render("campgrounds/index", { campgrounds })
}

module.exports.renderNew = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.showCampground = async (req, res) => {
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
}

// formからPOSTされる情報を、ejsで扱うようにするためには、以下を実行して値をパースする必要がある。  
// app.use(express.urlencoded({ extended: true })); 
// app.use(express.json()); //jsonデータをパスしてくれる記述
module.exports.createCampground = async (req, res) => {
    console.log(req.body);
    const geodate = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    
    console.log(geodate.body.features[0]);
    
    const campground = new Campground(req.body.campground);
    campground.geometry = geodate.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    // console.log(campground);
    req.flash('success', '新しいキャンプ場を登録しました');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.rendeerEditForm = async (req, res) => {
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
};

module.exports.update = async (req, res) => {
    // console.log(req.body);
    console.log(req.files);
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
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { useFindAndModify: false })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            try {
                const result = await cloudinary.uploader.destroy(filename);
                console.log(`Deleted ${filename}:`, result);
            } catch (err) {
                console.error(`Error deleting ${filename}:`, err);
            }
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash('success', 'キャンプ場を更新しました');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました');
    res.redirect("/campgrounds");
}