const mongoose = require("mongoose");
mongoose.set('useFindAndModify', false);

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
const allImages = [
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/e87imief8ny0tpycauv0.jpg',
        filename: 'YelpCamp/e87imief8ny0tpycauv0'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/qybxwf6tsctx4pgjvjki.jpg',
        filename: 'YelpCamp/qybxwf6tsctx4pgjvjki'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/sxxggjqmdfu1otneiroi.jpg',
        filename: 'YelpCamp/sxxggjqmdfu1otneiroi'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/tm8ipokp3tocklliduwt.jpg',
        filename: 'YelpCamp/tm8ipokp3tocklliduwt'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/ynmw5wujki1dlxmrypip.jpg',
        filename: 'YelpCamp/ynmw5wujki1dlxmrypip'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/vlsk4diosmsx28jtriqn.jpg',
        filename: 'YelpCamp/vlsk4diosmsx28jtriqn'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866904/YelpCamp/g4w2sbgrizfqebdomgb8.jpg',
        filename: 'YelpCamp/g4w2sbgrizfqebdomgb8'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/f06disbljxqcqkieperb.jpg',
        filename: 'YelpCamp/f06disbljxqcqkieperb'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/tqkl1cjg5yck6ye1gyvv.jpg',
        filename: 'YelpCamp/tqkl1cjg5yck6ye1gyvv'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/g7qkv2ds67nkz0tdpydx.jpg',
        filename: 'YelpCamp/g7qkv2ds67nkz0tdpydx'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/rhansemi1bta8jj93jp3.jpg',
        filename: 'YelpCamp/rhansemi1bta8jj93jp3'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/bxpvtogkwq672zdz9dbk.jpg',
        filename: 'YelpCamp/bxpvtogkwq672zdz9dbk'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/bo8xdrw1tf5hjyplti5d.jpg',
        filename: 'YelpCamp/bo8xdrw1tf5hjyplti5d'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/lj7fakwxdec1ilsdhum8.jpg',
        filename: 'YelpCamp/lj7fakwxdec1ilsdhum8'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/ior7i2qqjoz5bxd9rl9f.jpg',
        filename: 'YelpCamp/ior7i2qqjoz5bxd9rl9f'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/ib9pl0iru9n1iwv0ekix.jpg',
        filename: 'YelpCamp/ib9pl0iru9n1iwv0ekix'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/fe9kjb1oohjop3jmx0xv.jpg',
        filename: 'YelpCamp/fe9kjb1oohjop3jmx0xv'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/gkjizlmps5p7zn7sxhli.jpg',
        filename: 'YelpCamp/gkjizlmps5p7zn7sxhli'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/yuabjljqmsudjj1gy2js.jpg',
        filename: 'YelpCamp/yuabjljqmsudjj1gy2js'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/wyl2ct8nrmozzzhwsrcl.jpg',
        filename: 'YelpCamp/wyl2ct8nrmozzzhwsrcl'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/o8vcvgalfc6twujlqu3l.jpg',
        filename: 'YelpCamp/o8vcvgalfc6twujlqu3l'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866904/YelpCamp/xoozyaq386rrngyaiscr.jpg',
        filename: 'YelpCamp/xoozyaq386rrngyaiscr'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866903/YelpCamp/jook9plarnphwxrluaqs.jpg',
        filename: 'YelpCamp/jook9plarnphwxrluaqs'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866904/YelpCamp/acltwsr2qs0giajseywp.jpg',
        filename: 'YelpCamp/acltwsr2qs0giajseywp'
    },
    {
        url: 'https://res.cloudinary.com/dmw9hdayi/image/upload/v1719866904/YelpCamp/wm4cguusqgnwdbgfxyn4.jpg',
        filename: 'YelpCamp/wm4cguusqgnwdbgfxyn4'
    }
];


const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 20; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length)
        const description = campgroundDescriptions[Math.floor(Math.random() * campgroundDescriptions.length)]
        const price = Math.floor(Math.random() * 10000) + 1000;
        const imageUrl = await fetchRandomImage(); // 画像の非同期取得
        const getRandomImages = (num) => {
            const shuffled = allImages.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, num);
        };
        const camp = new Campground({
            author: '66766778d7f589c2d0030246',
            title: `${sample(descriptors)}・${sample(places)}`,
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`,
            description: description,
            price: price,
            images: getRandomImages(3)            
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

