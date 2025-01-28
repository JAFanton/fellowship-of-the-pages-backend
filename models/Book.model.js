const { Schema, model } = require('mongoose');

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    bookImageUrl: {
        type: String,
        required: true,
    },
    genre: {
        type: String,
        required: true,
        enum: ['Fiction', 'Non-Fiction']
    },
    wordCount: {
        type: Number,
        required: true,
      },
    review: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
},
{
    timestamps: true,
  }
);

module.exports = model('Book', bookSchema);