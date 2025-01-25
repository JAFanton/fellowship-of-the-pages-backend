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
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

module.exports = mongoose.model('Book', bookSchema);