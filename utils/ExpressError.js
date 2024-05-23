class ExpressError extends Error {
    Constructor(message, statusode) {
        super();
        this.messeage = messeage;
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;