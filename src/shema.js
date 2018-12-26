const mongoose = require("mongoose");
const Schema = mongoose.Schema;
 
const movieSchema = new Schema(
  {
    title: String,
    year: Number,
    format: String,
    stars: [String]
  }
)

const AccountSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Required!"],
      maxlength: [30, "Too Long!"],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Required!"],
    },
    movies: [movieSchema]
  }
)


module.exports = (mongoose.models && mongoose.models.Account)
? mongoose.models.Account
: mongoose.model('Account', AccountSchema)