import incomeModel from "../models/incomeModel.js";
import XLSX from 'xlsx';
import getDateRange from "../utils/dataFilter.js";

export async function addIncome(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {

        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "All fields are missing"
            })
        }


        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date: new Date(date)
        })

        await newIncome.save()

        res.json({
            success: true,
            message: "Income added succesfully"
        })


    } catch (error) {
        console.log("error happened with adding income, ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}



export async function getAllIncome(req, res) {
    const userId = req.user._id;
    console.log("\n\nUSER")
    console.log(userId)

    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });

        res.json(income)
    } catch (error) {
        console.log("error happened with getting income, ", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}



export async function updateIncome(req, res) {
    const { id } = req.params;

    const userId = req.user._id;

    const { description, amount } = req.body;

    try {
        const updatedIncomem = await incomeModel.findOneAndUpdate({
            _id: id, userId
        },
            { description, amount },
            { new: true }
        )

        res.json({ success: true, message: "income updated successfully", data: updateIncome })


    } catch (error) {
        console.log("error happened with updating income, ", error);
        res.status(404).json({
            success: false,
            message: "Income not found"
        })
    }
}



export async function deleteIncome(req, res) {
    const { id } = req.params;

    try {
        const income = await incomeModel.findByIdAndDelete({
            _id: id,
        },
        )

        if (!income) {
            res.status(404).json({
                success: false,
                message: "Income not found for deletion"
            })
        }

        res.json({ success: true, message: "income deleted successfully" })


    } catch (error) {
        console.log("error happened with deleting income, ", error);
        res.status(404).json({
            success: false,
            message: "Income not found"
        })
    }
}



/// to download excel

export async function downloadExcelForIncome(req, res) {
    const userId = req.user._id;

    try {
        const income = await incomeModel.find({ userId }).sort({ date: -1 });

        const plainData = income.map((income) => ({
            Description: income.description,
            Amount: income.amount,
            Category: income.category,
            Date: new Date(income.date).toLocaleDateString()

        }))

        const worksheet = XLSX.utils.json_to_sheet(plainData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "incomeModel");
        XLSX.writeFile(workbook, "income_details.xlsx");
        res.download("income_details.xlsx")


    } catch (error) {
        console.log("error happened with downloading income sheet, ", error);
        res.status(404).json({
            success: false,
            message: "Income not able to download"
        })
    }
}


export async function getIncomeOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.query;
        const { start, end } = getDateRange(range);


        const income = await incomeModel({
            userId,
            date: { $gte: start, $lte: end }
        }).sort(
            { date: -1 }
        )



        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
        const numberOfTransactions = incomes.length;

        const recentTransactions = incomes.slice(0, 9);


        res.json({
            success: true,
            data: {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions,
                range,
            }
        })
    } catch (error) {
        console.log("error happened with getting income overview, ", error);
        res.status(404).json({
            success: false,
            message: "Income not able to download"
        })
    }
}