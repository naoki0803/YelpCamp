if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express"); //要npm i ejs
const axios = require('axios');
require('dotenv').config();  //.env ファイルを読み込むために、dotenv
const path = require("path");
const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);
const ejsMate = require("ejs-mate");
const session = require('express-session')
const flash = require('connect-flash');
const Joi = require('joi');
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require("./models/user")
const helmet = require('helmet')  //セキュリティ関連のhttpheaderを不要してくれる
const mongoSanitize = require('express-mongo-sanitize');




const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const exp = require("constants");
const { truncate } = require("fs");

const MongoStore = require('connect-mongo');

//開発環境
// mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',
//'mongodb://127.0.0.1:27017/<DBの場所をここで指定できるので、以下の場合movieAppというディレクトリに保存される>>
//本番環境
// const dburl = process.env.DB_URL;

const dburl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dburl,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
)
    .then(() => {
        console.log("コネクション成功！！");
    })
    .catch(err => {
        console.log(err);
        console.log("MongoDBコネクションエラー");
    });


const app = express();

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//”getpost.ejs"のformからpostされたデータをパースしてくれる記述
//app.postのreq.bodyで中身を確認する為には、送られてくる情報をパースする必要がある
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
    replaceWith: '_',
}));


const secret = process.env.SECRET || 'mysecret'

// npm connect-mongo https://www.npmjs.com/package/connect-mongo
const store = MongoStore.create({
    mongoUrl: dburl,
    crypto: {
        secret
    },
    touchAfter : 24 * 3600 //sessionに変更がなければ1日間はsessionを保存しにいかない設定
});

store.on('error', e => {
    console.log('セッションストアエラー', e);
})


const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, //sessionに関連したCookieをhttp経由出ないと接続できなくするので、クライアントサイドのjavascriptからCookieにアクセスできない
        // secure: true,   //httpsでないと、Cookieのやり取りをしなくなる(今回の開発環境はhttp通信のため、コメントアウトしないとログインなどsesseionを利用している部分が機能しなくなるff)
        maxAge: 1000 * 60 * 60 * 24 * 7 //1week
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());    //expressのsessionの後に記載する必要がある。
passport.use(new localStrategy(User.authenticate()));    //userモデルでpassportfLocalMongooseをプラグインすることで、aythenticate()というstaticメソッドが利用できる
passport.serializeUser(User.serializeUser());   //passport.serializeUserで、sessionにどの用にuserの情報を渡すかを伝えている。
passport.deserializeUser(User.deserializeUser());

// {
//     "localStrategy": "どの用なログインするか",
//     "User.aythenticate": "どの用に認証するか",
//     "User.serializeUser": "どの用にsessionに情報を保存するか",
//     "User.deserializeUser": "どの用にsessionから情報を取り出すか"
// }

app.use(flash());
app.use(helmet({
    contentSecurityPolicy: false
}));  //引数無しで実行するとdefaultで11個のミドルウェアを実行する
app.use((req, res, next) => {
    console.log(req.query);
    // console.log("appjsの中身(returnToの値がある)", req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const scriptSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const styleSrcUrls = [
    'https://api.mapbox.com',
    'https://cdn.jsdelivr.net'
];
const connectSrcUrls = [
    'https://api.mapbox.com',
    'https://*.tiles.mapbox.com',
    'https://events.mapbox.com'
];
const fontSrcUrls = [];
const imgSrcUrls = [
    `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/`,
    'https://images.unsplash.com'
];

//helmet.contentSecurityPolicy()を定義する事で、記載しているsrc元の情報を参照しする事ができる。
//https://www.npmjs.com/package/helmet#content-security-policy
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        childSrc: ["blob:"],
        objectSrc: [],
        imgSrc: ["'self'", 'blob:', 'data:', ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls]
    }
}));

app.use(express.json()); //jsonデータをパスしてくれる記述




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

app.get('/fakeUser', async (req, res) => {
    const user = new User({
        email: 'hogehoge@example.com', username: 'hogehoge'
    });
    const newUser = await User.register(user, 'moge');
    res.send(newUser);
});

//router
app.use('/', userRoutes);
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