const express = require("express"); //要npm i ejs
const path = require("path");
const mongoose = require("mongoose");
const Campground = require("./models/campground");

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


const app = express();

app.set("view engine", "ejs"); //要npm i ejs
app.set("views", path.join(__dirname, "views"));


app.get("/", (req, res) => {
    // res.send("TOPページ")
    res.render("home")
});


app.get("/makecampground", async (req, res) => {
    const camp = new Campground({title: "私の庭", price: 1000, discription: "気軽に安くキャンプ"});
    await camp.save();
    res.send(camp); 
});


const test = new Campground({
    
})


app.listen(3000, () => {
    console.log("サーバーをPort3000で受付中")
})