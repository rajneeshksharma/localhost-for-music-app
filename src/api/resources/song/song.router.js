import express from 'express';
import passport from 'passport';
import songController from './song.controller';
import { isArtist } from '../../middelwares/isArtist';

export const songRouter = express.Router();

songRouter.route('/')
.post([passport.authenticate('jwt',{session:false}),isArtist],songController.create)
.get(passport.authenticate('jwt',{session:false}),songController.findAll);

songRouter.route('/:id')
.get(passport.authenticate('jwt',{session:false}),songController.findOne)
.delete([passport.authenticate('jwt',{session:false}),isArtist],songController.delete)
.put([passport.authenticate('jwt',{session:false}),isArtist],songController.update);