import express from 'express';
import userController from './user.controller';
import passport from 'passport';

export const userRouter = express.Router();

userRouter.post('/signup',userController.signup);
userRouter.post('/login',userController.login);
userRouter.get('/verify',userController.verify);
userRouter.post('/forpass', userController.forPass);
userRouter.get('/forpassverify', userController.forpassverify);
//testing Purposes route

userRouter.get('/me',passport.authenticate('jwt',{session:false}),userController.auth);