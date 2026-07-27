import React from 'react';
import Page from './Page';

function FAQs() {
  return (
    <Page title="Frequently Asked Questions">

      <p>
        <strong>Q: How do I place an order?</strong><br />
        Browse our collection, choose your favorite products, add them to your
        cart, and proceed to checkout by entering your shipping details.
      </p>

      <p>
        <strong>Q: What payment methods do you accept?</strong><br />
        We accept Visa, Mastercard, JazzCash, EasyPaisa, and Cash on Delivery (COD).
      </p>

      <p>
        <strong>Q: How long does delivery take?</strong><br />
        Orders are usually delivered within <strong>3–5 business days</strong>,
        depending on your location.
      </p>

      <p>
        <strong>Q: Can I return or exchange a product?</strong><br />
        Yes. We offer a <strong>7-day return and exchange policy</strong> for
        eligible products. Please read our Return & Exchange Policy for complete details.
      </p>

      <p>
        <strong>Q: Do you offer free shipping?</strong><br />
        Yes, we provide <strong>free shipping on orders above Rs. 3,000</strong>.
      </p>

      <p>
        <strong>Q: How can I contact customer support?</strong><br />
        You can reach us through our email, phone number, or WhatsApp during
        our business hours. We're always happy to help.
      </p>

    </Page>
  );
}

export default FAQs;