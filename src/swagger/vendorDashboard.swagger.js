/**
 * @openapi
 * /vendor/{vendorId}/overview:
 *   get:
 *     summary: Get vendor dashboard overview
 *     parameters:
 *       - in: path
 *         name: vendorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor overview data
 */
