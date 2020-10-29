const mongoose = require("mongoose");

const connectDb = async () => {
    try {
        const connection = await mongoose.connect(
            "mongodb+srv://vladimir:vladimir@nodejsatlas.tiqxb.mongodb.net/buglogger?retryWrites=true&w=majority",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                useCreateIndex: true,
            }
        );
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

module.exports = connectDb;
