const Report = require('../models/report.model');

class ReportRepository {
  create(report) {
    return Report.create(report);
  }
}

module.exports = new ReportRepository();
