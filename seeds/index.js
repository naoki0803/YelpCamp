const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
const seedHelpers = require("./seedHelpers");

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

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length)
        const randomDescriptorsIndex = Math.floor(Math.random() * descriptors.length)
        const randomPlacesIndex = Math.floor(Math.random() * places.length)
        const camp = new Campground({
            title: `${sample(descriptors)}・${sample(places)}`,
            location: `${cities[randomCityIndex].prefecture}${cities[randomCityIndex].city}`
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