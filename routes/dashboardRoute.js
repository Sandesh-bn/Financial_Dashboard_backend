import express from 'express';


import { getDashBoardOverview } from '../controllers/dashboardController.js';

import authMiddleware from '../middleware/auth.js';

const dashboarRouter = express.Router();

dashboarRouter.get("/", authMiddleware, getDashBoardOverview);


export default dashboarRouter;