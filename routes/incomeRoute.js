import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { addIncome, deleteIncome, downloadExcelForIncome, getAllIncome, getIncomeOverview, updateIncome } from '../controllers/incomeController.js';

const incomeRouter = express.Router();

incomeRouter.post("/add", authMiddleware, addIncome);

incomeRouter.get("/get", authMiddleware, getAllIncome);


incomeRouter.put("/update/:id", authMiddleware, updateIncome);

incomeRouter.get("/downloadexcel", authMiddleware, downloadExcelForIncome);

incomeRouter.delete("/delete/:id", authMiddleware, deleteIncome);


incomeRouter.get("/overview", authMiddleware, getIncomeOverview);


export default incomeRouter;

