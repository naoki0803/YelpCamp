const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const seedHelpers = require("./seedHelpers");
const { descriptors, places } = require("./seedHelpers");
const axios = require('axios');
require('dotenv').config();  //.env ファイルを読み込むために、dotenv 

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log("コネクション成功！！");
    })
    .catch(err => {
        console.log(err);
        console.log("MongoDBコネクションエラー");
    });

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};


const campgroundDescriptions = [
    "キャンプ場Aは、都会の喧騒から離れた自然豊かな場所に位置しています。キャンプファイヤーを囲みながら星空を眺める贅沢な時間を過ごすことができます。",
    "キャンプ場Bは、清流が流れる森林の中に位置しています。川遊びや釣りなど、アウトドアな遊びに最適な環境です。夜は虫の音と川のせせらぎを聞きながら、リラックスできます。",
    "キャンプ場Cは、山の中腹に位置しています。キャンプサイトからは、四季折々の美しい景色を見ることができます。夜は満点の星空を楽しみながら、贅沢な時間を過ごしましょう。",
    "キャンプ場Dは、広大な草原に位置しています。キャンプサイトからは、絶景の風景を眺めることができます。夜はキャンプファイヤーを囲んで、星空を見ながら思い出話に花を咲かせましょう。",
    "キャンプ場Eは、湖畔に位置しています。朝は湖畔の美しい景色を見ながらコーヒーを飲むことができます。夜は湖面に映る満点の星空を楽しむことができます。"
];

//unsplashのAPIでランダムな画像を取得
async function fetchRandomImage() {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    const apiUrl = `https://api.unsplash.com/photos/random?client_id=${accessKey}&collections=483251`;  //&collectionsでqueryを繋げることで、特定コレクションから画像を取得している

    try {
        const response = await axios.get(apiUrl);
        const imageData = response.data;
        const imageUrl = imageData.urls.regular;
        return imageUrl;

    } catch (error) {
        console.error('Error fetching image:', error.message);
    }
}

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 10; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length)
        const description = campgroundDescriptions[Math.floor(Math.random() * campgroundDescriptions.length)]
        const price = Math.floor(Math.random() * 10000) + 1000;
        const imageUrl = await fetchRandomImage(); // 画像の非同期取得
        const camp = new Campground({
            title: `${sample(descriptors)}・${sample(places)}`,
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            description: description,
            price: price,
            image: imageUrl
        });
        await camp.save();
    }
};


seedDB()
    .then(data => {
        console.log("保存成功、mongooseの接続を切断します。");
        mongoose.connection.close();
    })
    .catch(err => {
        console.log("保存失敗");
        console.log(err);
    });

