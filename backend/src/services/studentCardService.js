const { StudentCard } = require('../models');
const { ApiError } = require('../middleware/errorHandler');

class StudentCardService {
  static async getCard(userId) {
    const card = await StudentCard.findOne({ where: { userId } });

    if (!card) {
      throw new ApiError(404, 'Student card not found');
    }

    return {
      id: card.id,
      cardNumber: card.cardNumber,
      status: card.status,
      expiryDate: card.expiryDate,
      issueDate: card.issueDate
    };
  }
}

module.exports = StudentCardService;
