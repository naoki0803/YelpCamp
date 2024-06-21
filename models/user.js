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

userSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        MissingPasswordError: 'パスワードが指定されていません',
        AttemptTooSoonError: 'アカウントは現在ロックされています。しばらくしてからもう一度お試しください',
        TooManyAttemptsError: 'ログイン試行の失敗回数が多すぎるためアカウントがロックされました',
        NoSaltValueStoredError: '認証できません。',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています',
        MissingUsernameError: 'ユーザー名が指定されていません',
        UserExistsError: 'そのユーザー名は既に登録されています'
    }
});

module.exports = mongoose.model('User', userSchema);