const { CalendarEvent } = require('../models');
const { ApiError } = require('../middleware/errorHandler');
const { Op } = require('sequelize');

class CalendarService {
  static async getEvents(userId, dateParam, monthParam) {
    let whereClause = { userId };

    if (dateParam) {
      // Get events for a specific date
      const date = new Date(dateParam);
      if (isNaN(date.getTime())) {
        throw new ApiError(400, 'Invalid date format');
      }
      whereClause.date = dateParam;
    } else if (monthParam) {
      // Get events for a specific month
      const [year, month] = monthParam.split('-');
      const startDate = `${year}-${month}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    } else {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      whereClause.date = today;
    }

    const events = await CalendarEvent.findAll({
      where: whereClause,
      order: [['date', 'ASC'], ['time', 'ASC']],
      attributes: ['id', 'date', 'time', 'title', 'createdAt']
    });

    return events;
  }

  static async createEvent(userId, createEventRequest) {
    const { date, time, title } = createEventRequest;

    if (!date || !time || !title) {
      throw new ApiError(400, 'Date, time, and title are required');
    }

    // Validate date format
    if (isNaN(new Date(date).getTime())) {
      throw new ApiError(400, 'Invalid date format');
    }

    const event = await CalendarEvent.create({
      userId,
      date,
      time,
      title
    });

    return {
      id: event.id,
      date: event.date,
      time: event.time,
      title: event.title,
      createdAt: event.createdAt
    };
  }

  static async deleteEvent(userId, eventId) {
    const event = await CalendarEvent.findByPk(eventId);

    if (!event) {
      throw new ApiError(404, 'Event not found');
    }

    if (event.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own events');
    }

    await event.destroy();

    return { message: 'Event deleted successfully' };
  }
}

module.exports = CalendarService;
