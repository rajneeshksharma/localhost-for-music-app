import mongoose from 'mongoose';
mongoose.Promise = global.Promise;

export const connect = ( ) => mongoose.connect('mongodb://localhost/rkmusic_api',{ useCreateIndex: true,
  useNewUrlParser: true });