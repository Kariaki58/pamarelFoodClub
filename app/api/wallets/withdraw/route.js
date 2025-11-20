import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import BankAccount from '@/models/BankAccount';
import Transaction from '@/models/Transaction';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { walletType, amount, bankCode, accountNumber, accountName, saveAccount } = await req.json();

        await connectToDatabase();

        // Get user with current balance
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Check sufficient balance
        const currentBalance = user.earnings[`${walletType}Wallet`] || 0;
        if (amount > currentBalance) {
            return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }

        // Get bank name
        const banksResponse = await fetch('https://api.flutterwave.com/v3/banks/NG', {
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY_LIVE}`,
                'Content-Type': 'application/json'
            }
        });

        const banksData = await banksResponse.json();
        const bank = banksData.data.find(b => b.code === bankCode);
        const bankName = bank ? bank.name : 'Unknown Bank';

        // Save bank account if requested
        if (saveAccount) {
            const existingAccount = await BankAccount.findOne({
                userId: session.user.id,
                accountNumber,
                bankCode
            });

            if (!existingAccount) {
                await BankAccount.create({
                    userId: session.user.id,
                    accountNumber,
                    accountName,
                    bankCode,
                    bankName
                });
            }
        }

        // Initiate transfer with Flutterwave
        const reference = `WDR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const transferResponse = await fetch('https://api.flutterwave.com/v3/transfers', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY_LIVE}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_bank: bankCode,
                account_number: accountNumber,
                amount: amount,
                narration: `Withdrawal from ${walletType} wallet`,
                currency: 'NGN',
                reference,
                callback_url: `${process.env.NEXTAUTH_URL}/api/wallets/withdraw-webhook`,
                debit_currency: 'NGN'
            })
        });

        const transferData = await transferResponse.json();

        console.log({ transferData })

        if (transferData.status !== 'success') {
            return NextResponse.json({
                success: false,
                error: transferData.message || 'Transfer failed'
            }, { status: 400 });
        }

        // Create withdrawal transaction record
        const transaction = new Transaction({
            transactionId: reference,
            flutterwaveTxRef: reference,
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            userPhone: user.phone,
            amount: amount,
            currency: 'NGN',
            planType: 'wallet_withdraw',
            planName: `${walletType.toUpperCase()} Wallet Withdrawal`,
            status: 'pending',
            paymentStatus: 'pending',
            paymentMethod: 'bank_transfer',
            meta: {
                walletType,
                bankCode,
                bankName,
                accountNumber,
                accountName,
                transferId: transferData.data.id
            }
        });

        await transaction.save();

        // Deduct from user's wallet (will be confirmed via webhook)
        user.earnings[`${walletType}Wallet`] = currentBalance - amount;
        await user.save();

        return NextResponse.json({
            success: true,
            message: 'Withdrawal initiated successfully',
            reference,
            transferId: transferData.data.id
        });

    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json({
            success: false,
            error: 'Withdrawal failed. Please try again.'
        }, { status: 500 });
    }
}