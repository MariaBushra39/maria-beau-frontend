import React from 'react';
import Page from './Page';

function TrackOrder() {
  return (
    <Page title="Track Your Order">
      <p>
        Stay updated with your order status. Once your order has been shipped,
        you'll receive a confirmation email or SMS containing your tracking
        number and delivery details.
      </p>

      <p>
        <strong>How to Track:</strong> Enter your Order ID or Tracking Number
        in the tracking section to view the latest shipping updates.
      </p>

      <p>
        <strong>Shipping Updates:</strong> You'll be able to check whether your
        order is being processed, dispatched, in transit, or delivered.
      </p>

      <p>
        <strong>Need Help?</strong> If you haven't received your tracking
        details or have any questions about your order, please contact our
        customer support team. We'll be happy to assist you.
      </p>

      <p>
        <strong>MariaBeau – Track Your Order with Ease.</strong>
      </p>
    </Page>
  );
}

export default TrackOrder;