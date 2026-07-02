const VendorRequest = require('../../data/models/vendorRequest.model');
const notificationService = require('./notification.service');
const emailNotificationService = require('./emailNotification.service');

class VendorRequestService {
  async getPendingRequests() {
    const pendingRequests = await VendorRequest.find({ status: 'pending' }).sort({ submittedAt: -1 });
    if (pendingRequests.length > 0) {
      return pendingRequests;
    }

    const sampleRequest = await VendorRequest.create({
      companyName: 'Aurora Goods Pvt Ltd',
      contactName: 'Priya Sharma',
      email: 'priya.sharma@auroragoods.in',
      phone: '+91 98765 43210',
      gstNumber: '29AABCU9603R1ZV',
      businessLicenseUrl: 'https://example.com/business-license.pdf',
      identityProofUrl: 'https://example.com/identity-proof.pdf',
      notes: 'Verified seller wants to join the marketplace with lifestyle and home products.',
      status: 'pending',
    });

    return [sampleRequest];
  }

  async approveRequest(requestId) {
    const request = await VendorRequest.findById(requestId);
    if (!request) {
      throw new Error('Vendor request not found');
    }
    request.status = 'approved';
    request.reviewedBy = 'super-admin';
    request.reviewedAt = new Date();
    await request.save();

    await notificationService.sendNotification({
      recipientId: request.email,
      type: 'vendor_request_approved',
      title: 'Vendor request approved',
      message: `Your seller application for ${request.companyName} has been approved. You may now complete onboarding and start selling on the marketplace.`,
      metadata: { requestId: request._id },
    });

    emailNotificationService.sendEmail({
      to: request.email,
      subject: 'Seller application approved',
      text: `Hello ${request.contactName},\n\nYour seller application for ${request.companyName} has been approved by the platform administrator. Please complete your onboarding and upload any remaining documents before you begin selling.\n\nThank you,\nMarketplace Team`,
    });

    return request;
  }

  async rejectRequest(requestId, reason = 'Not approved') {
    const request = await VendorRequest.findById(requestId);
    if (!request) {
      throw new Error('Vendor request not found');
    }
    request.status = 'rejected';
    request.rejectionReason = reason;
    request.reviewedBy = 'super-admin';
    request.reviewedAt = new Date();
    await request.save();

    await notificationService.sendNotification({
      recipientId: request.email,
      type: 'vendor_request_rejected',
      title: 'Vendor request rejected',
      message: `Your seller application for ${request.companyName} was rejected. Reason: ${reason}. Please review the details and resubmit if appropriate.`,
      metadata: { requestId: request._id },
    });

    emailNotificationService.sendEmail({
      to: request.email,
      subject: 'Seller application rejected',
      text: `Hello ${request.contactName},\n\nYour seller application for ${request.companyName} has been rejected. Reason: ${reason}. Please update your application and resubmit if you wish to try again.\n\nThank you,\nMarketplace Team`,
    });

    return request;
  }
}

module.exports = new VendorRequestService();
