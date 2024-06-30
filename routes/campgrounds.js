const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require('../middleware');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })


router.route("/")   //router.httpMethod(getやpostなど)の様な記述で1つづつRouterを定義もできるが、同一のパスであれば、router.routeで同一のルートをグルーピングできる。個別に定義していたパス(touter.get("/")の("/")の部分は必要なくなる
    //一覧ページ 
    .get(catchAsync(campgrounds.index))
    //Post新規登録
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send('リクエストを受け付けました');;
    });

//Get新規登録
router.get("/new", isLoggedIn, campgrounds.renderNew);

router.route("/:id")
    //Get詳細細ページ
    .get(catchAsync(campgrounds.showCampground))
    //put編集
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.update))
    //削除
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//編集ページ
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.rendeerEditForm));

module.exports = router;