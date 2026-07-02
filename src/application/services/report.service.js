class ReportService {
  generateReport(query) {
    return { query, report: [] };
  }
}

module.exports = new ReportService();
