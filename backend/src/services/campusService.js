const { CampusLocation, ServiceItem } = require('../models');

class CampusService {
  static async getCampusLocations() {
    const locations = await CampusLocation.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description', 'latitude', 'longitude', 'category']
    });

    return locations;
  }

  static async getServices() {
    const services = await ServiceItem.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'description', 'icon', 'category', 'url']
    });

    return services;
  }
}

module.exports = CampusService;
