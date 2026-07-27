import React from 'react';
import Page from './Page';

function Contact() {
  return (
    <Page title="Contact Us">
      <p>We’d love to hear from you! Reach out to us anytime.</p>
      
      <p>
        <strong>Email:</strong> <br />
        <a href="mailto:mariabushra392@gmail.com" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>
          mariabushra392@gmail.com
        </a>
      </p>
      
      <p>
        <strong>Phone:</strong> <br />
        <a href="tel:+923296892140" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>
          +923296892140
        </a>
      </p>
      
      <p>
        <strong>WhatsApp:</strong> <br />
        <a href="tel:+923296892140" style={{ color: '#1a1a1a', textDecoration: 'underline' }}>
          +923296892140
        </a>
      </p>
      
      <p>
        <strong>Office Hours:</strong> <br />
        Mon – Sat, 10:00 AM – 8:00 PM (PKT)
      </p>
      
      <p>Our team will respond within 24 hours.</p>
    </Page>
  );
}

export default Contact;