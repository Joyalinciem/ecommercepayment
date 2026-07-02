module.exports = {
  orderConfirmation: (order) => ({
    subject: `Order ${order.id} confirmed`,
    body: `Your order ${order.id} was successfully placed. Total: ${order.total}.`,
  }),
  refundNotification: (refund) => ({
    subject: `Refund ${refund.orderId} processed`,
    body: `Your refund request for order ${refund.orderId} has been processed. Amount: ${refund.amount}.`,
  }),
};
