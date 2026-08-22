import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

// ✅ No existing phone number config/env variable was found in the project
// (the footer also hardcodes it directly in App.jsx), so it's defined here
// as a clear constant — update this single line if the number ever changes.
const WHATSAPP_NUMBER = '923296892140'; // no "+" or leading zeros, per wa.me format
const WHATSAPP_MESSAGE = 'Hi MariaBeau, I would like to know more about your products.';

function WhatsAppButton() {
  const chatUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      <style>{`
        .mb-whatsapp-btn {
          position: fixed;
          bottom: 24px;
          left: 24px;
          width: 56px;
          height: 56px;
          background: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 18px rgba(0,0,0,0.22);
          z-index: 900; /* below the welcome popup (9999) but above normal page content */
          text-decoration: none;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .mb-whatsapp-btn:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 24px rgba(0,0,0,0.28);
        }
        .mb-whatsapp-icon {
          color: #ffffff;
          font-size: 28px;
        }
        .mb-whatsapp-tooltip {
          position: absolute;
          left: 68px;
          top: 50%;
          transform: translateY(-50%);
          background: #1a1a1a;
          color: #ffffff;
          font-size: 12.5px;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 5px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }
        .mb-whatsapp-tooltip::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
          border: 5px solid transparent;
          border-right-color: #1a1a1a;
        }
        .mb-whatsapp-btn:hover .mb-whatsapp-tooltip {
          opacity: 1;
        }

        /* Mobile: icon only, no tooltip (avoids taking up screen space / accidental taps) */
        @media (max-width: 768px) {
          .mb-whatsapp-btn {
            width: 50px;
            height: 50px;
            bottom: 18px;
            left: 18px;
          }
          .mb-whatsapp-icon {
            font-size: 25px;
          }
          .mb-whatsapp-tooltip {
            display: none;
          }
        }
      `}</style>

      <a
        href={chatUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-whatsapp-btn"
        aria-label="Chat with MariaBeau on WhatsApp"
      >
        <FaWhatsapp className="mb-whatsapp-icon" />
        <span className="mb-whatsapp-tooltip">Chat with us on WhatsApp</span>
      </a>
    </>
  );
}

export default WhatsAppButton;