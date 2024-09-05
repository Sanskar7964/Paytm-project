const mongoose = require("mongoose")
const Account = require("../models/bank");

async function handleGetBalance(req, res) {
    try {
        const account = await Account.findOne({ userId: req.userId });
        if (!account) {
            return res.status(404).json({
                message: "Account not found"
            });
        }
        res.json({
            balance: account.balance
        });
    } catch (error) {
        console.error("Error fetching balance:", error);
        res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function handleTransfer(req, res) {
    const session = await mongoose.startSession();
    try {
        session.startTransaction();
        const { amount, to } = req.body;

        // Fetch the accounts within the transaction
        const senderAccount = await Account.findOne({ userId: req.userId }).session(session);
        const receiverAccount = await Account.findOne({ userId: to }).session(session);

        if (!senderAccount || senderAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        if (!receiverAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid recipient account"
            });
        }

        // Perform the transfer
        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        // Commit the transaction
        await session.commitTransaction();

        // Fetch updated balances
        const updatedSenderAccount = await Account.findOne({ userId: req.userId });
        const updatedReceiverAccount = await Account.findOne({ userId: to });

        res.json({
            message: "Transfer successful",
            senderNewBalance: updatedSenderAccount.balance,
            receiverNewBalance: updatedReceiverAccount.balance
        });

    } catch (error) {
        await session.abortTransaction();
        console.error("Transfer error:", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    } finally {
        session.endSession();
    }
}

module.exports = {
    handleGetBalance,
    handleTransfer
}
