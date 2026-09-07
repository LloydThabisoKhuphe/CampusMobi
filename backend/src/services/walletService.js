const { Wallet, Transaction, User } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

class WalletService {
  static async getWallet(userId) {
    const wallet = await Wallet.findOne({
      where: { userId },
      include: {
        association: 'transactions',
        attributes: ['id', 'type', 'amount', 'description', 'balanceAfter', 'timestamp']
      }
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    return {
      id: wallet.id,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency,
      transactions: wallet.transactions || []
    };
  }

  static async topUp(userId, amount) {
    if (amount <= 0) {
      throw new ApiError(400, 'Top-up amount must be positive');
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    // Update wallet balance
    const oldBalance = parseFloat(wallet.balance);
    const newBalance = oldBalance + parseFloat(amount);
    
    wallet.balance = newBalance;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      walletId: wallet.id,
      type: 'TOPUP',
      amount,
      description: 'Top-up',
      balanceAfter: newBalance,
      timestamp: new Date()
    });

    return {
      id: wallet.id,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency
    };
  }

  static async pay(userId, payRequest) {
    const { amount, label } = payRequest;

    if (amount <= 0) {
      throw new ApiError(400, 'Payment amount must be positive');
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    const currentBalance = parseFloat(wallet.balance);
    if (currentBalance < amount) {
      throw new ApiError(400, 'Insufficient balance for payment');
    }

    // Update wallet balance
    const newBalance = currentBalance - parseFloat(amount);
    wallet.balance = newBalance;
    await wallet.save();

    // Create transaction record
    await Transaction.create({
      walletId: wallet.id,
      type: 'PAYMENT',
      amount,
      description: label || 'Payment',
      balanceAfter: newBalance,
      timestamp: new Date()
    });

    return {
      id: wallet.id,
      balance: parseFloat(wallet.balance),
      currency: wallet.currency
    };
  }
}

module.exports = WalletService;
