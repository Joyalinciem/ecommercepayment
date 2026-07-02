const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTopProducts, buildSellerPerformance } = require('../src/helper/vendorDashboardHelper');

test('buildTopProducts ranks products by sales count and revenue', () => {
  const sales = [
    { productName: 'Laptop', amount: 1200, orderId: 'A' },
    { productName: 'Laptop', amount: 900, orderId: 'B' },
    { productName: 'Headphones', amount: 300, orderId: 'C' },
    { productName: 'Mouse', amount: 150, orderId: 'D' },
  ];

  const result = buildTopProducts(sales, 3);

  assert.equal(result[0].productName, 'Laptop');
  assert.equal(result[0].salesCount, 2);
  assert.equal(result[0].revenue, 2100);
  assert.equal(result[1].productName, 'Headphones');
  assert.equal(result[2].productName, 'Mouse');
});
