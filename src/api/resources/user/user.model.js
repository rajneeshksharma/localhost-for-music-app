import mongoose from 'mongoose';
const {
    Schema
} = mongoose;

export const STANDARD_ROLE = 2;
export const ARTIST_ROLE = 1;
const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    role: {
        type: Number,
        default: null
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    saltRand: {
        type: String,
        default: null
    },
    social_id: {
        type: String,
        require: true,
        default: null
    },
    provider: {
        type: String,
        required: true,
        default: "Local"
    }
});
export default mongoose.model('User', userSchema);