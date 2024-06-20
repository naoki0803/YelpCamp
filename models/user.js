const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const { Schema } = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

// passportLocalMonggoseをplugin()する事で、userSchemaに定義していなくても、username,hash、soltが自動的に定義される用になる
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);