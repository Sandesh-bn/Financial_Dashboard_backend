import expenseModel from "../models/expenseModel.js";

import getDateRange from "../utils/dataFilter.js";

import XLSX from 'xlsx';


export async function addExpense(req, res){
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {

        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are missing"
            })
        }


        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        })

        await newExpense.save()

        res.json({
            success: true,
            message: "Expense added succesfully"
        })


    } catch (error) {
        console.log("error happened with adding expense, ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}


export async function getAllExpense(req, res){
     const userId = req.user._id;
    console.log("\n\nUSER")
    console.log(userId)

    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });

        res.json(expense)
    } catch (error) {
        console.log("error happened with getting expense, ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}


export async function updateExpense(req, res){
     const { id } = req.params;

    const userId = req.user._id;

    const { description, amount } = req.body;

    try {
        const updatedExpense = await expenseModel.findOneAndUpdate({
            _id: id, userId
        },
            { description, amount },
            { new: true }
        )

        res.json({ success: true, message: "expense updated successfully", data: updateExpense })


    } catch (error) {
        console.log("error happened with updating expense, ", error);
        res.status(404).json({
            success: false,
            message: "expense not found"
        })
    }
}



export async function deleteExpense(req, res){
    const { id } = req.params;

    try {
        const expense = await expenseModel.findByIdAndDelete({
            _id: id,
        },
        )

        if (!expense) {
            res.status(404).json({
                success: false,
                message: "Expense not found for deletion"
            })
        }

        res.json({ success: true, message: "expense deleted successfully" })


    } catch (error) {
        console.log("error happened with deleting expense, ", error);
        res.status(404).json({
            success: false,
            message: "Expense not found"
        })
    }
}





/// to download excel

export async function downloadExcelForExpense(req, res) {
    const userId = req.user._id;

    try {
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });

        const plainData = expenses.map((expense) => ({
            Description: expense.description,
            Amount: expense.amount,
            Category: expense.category,
            Date: new Date(expense.date).toLocaleDateString()

        }))

        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "expenseModel");
        XLSX.writeFile(workbook, "expense_details.xlsx");
        res.download("expense_details.xlsx")


    } catch (error) {
        console.log("error happened with downloading expense sheet, ", error);
        res.status(404).json({
            success: false,
            message: "expense not able to download"
        })
    }
}






export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);


        const expenses = await expenseModel({
            userId,
            date: { $gte: start, $lte: end }
        }).sort(
            { date: -1 }
        )



        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
        const numberOfTransactions = expenses.length;

        const recentTransactions = expenses.slice(0, 5);


        res.json({
            success: true,
            data: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range,
            }
        })
    } catch (error) {
        console.log("error happened with getting expense overview, ", error);
        res.status(404).json({
            success: false,
            message: "Expense not able to download"
        })
    }
}