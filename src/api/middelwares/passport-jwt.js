import Passport from 'passport';
import PassportJWT from 'passport-jwt';
import { devConfig } from '../../config/env/development';
import User from '../resources/user/user.model';
export const configJWTStrategy = () => {
    const Opts ={
        jwtFromRequest: PassportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey :  devConfig.secret,

    };
    Passport.use(new PassportJWT.Strategy(Opts,(payload,done)=>{
        User.findOne({_id : payload._id}, (err,user) => {
            if(err)
            return done(err);
            if(user)
            return done(null, user);
            return done(null, false);
        })
     }));
}