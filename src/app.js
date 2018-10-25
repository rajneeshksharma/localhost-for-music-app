import express from 'express';
import logger from 'morgan';
import passport from 'passport';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { connect } from './config/db';
import { restRouter } from './api';
import swaggerDocument from './config/swagger.json';
import { configJWTStrategy } from './api/middelwares/passport-jwt';
const app = express();

app.use(cors());

const PORT = 8000;
//mongodb
connect();

app.use(express.json());
app.use(express.urlencoded({extended :true }));
app.use(logger('dev'));
app.use('/api',restRouter);

//passport
app.use(passport.initialize());
configJWTStrategy();

//swagger
app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument ,{explorer :true}));
 app.use((req, res, next) => {
    const error = new Error('Not found');
    error.message = 'Invalid route';
    error.status = 404;
    next(error);
  });

  app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.json({
      error: {
        message: error.message,
      },
    });
  });
  
  app.listen(PORT, () => {
    console.log(`Server is running at PORT http://localhost:${PORT}`);
  });