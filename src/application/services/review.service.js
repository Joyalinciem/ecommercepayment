const orderRepository = require('../../data/repository/order.repository');
const reviewRepository = require('../../data/repository/review.repository');

class ReviewService {
  async submitReview(reviewDto) {
    if (!reviewDto || !reviewDto.orderId || !reviewDto.userId) {
      throw new Error('Missing required review fields');
    }

    const order = await orderRepository.findByOrderId(reviewDto.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.userId !== reviewDto.userId) {
      throw new Error('Invalid user for this order');
    }

    if (order.paymentStatus !== 'completed' && order.status !== 'payment_confirmed') {
      throw new Error('Cannot submit review before payment is confirmed');
    }

    const reviewPayload = {
      productId: reviewDto.productId || order.productId || order.productName || '',
      customerId: reviewDto.userId,
      orderId: reviewDto.orderId,
      rating: Number(reviewDto.rating),
      title: reviewDto.title || 'Product review',
      body: reviewDto.comment || reviewDto.body || '',
      images: reviewDto.images || [],
      helpfulVotes: 0,
      isFlagged: false,
      isApproved: true,
    };

    const created = await reviewRepository.create(reviewPayload);

    return { created: true, review: created };
  }

  async getProductReviews(productId) {
    if (!productId) {
      throw new Error('Product ID required');
    }
    return reviewRepository.findByProductId(productId);
  }
}

module.exports = new ReviewService();
