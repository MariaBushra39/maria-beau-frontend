import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// 🔁 Replace only this image
import welcomeImage from '../assets/welcome-popup.jpg';

const STORAGE_KEY = 'mariabeau_welcome_popup_shown';
const SHOW_DELAY_MS = 4500;

function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const handleShopNow = () => {
    dismiss();
    navigate('/');
  };

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText('MAR39');
      toast.success('Code copied: MAR39');
    } catch {
      toast.error('Unable to copy code');
    }
  };

  if (!visible) return null;

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .mb-welcome-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(20, 20, 20, 0.62);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
          animation: mbFadeIn 0.3s ease;
        }

        @keyframes mbFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes mbCardIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* ANIMATION FOR 10% OFF */
        @keyframes discountPop {
          0% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.15) translateY(-4px); }
          100% { transform: scale(1) translateY(0); }
        }

        .mb-welcome-card {
          position: relative;
          width: min(760px, 92vw);
          min-height: 420px;
          display: grid;
          grid-template-columns: 44% 56%;
          overflow: hidden;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 25px 70px rgba(0,0,0,0.30), 0 4px 16px rgba(0,0,0,0.08);
          animation: mbCardIn 0.4s ease;
        }

        .mb-welcome-image-wrap {
          position: relative;
          min-height: 420px;
          overflow: hidden;
          background: #eee;
        }

        .mb-welcome-image-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.14), transparent 35%);
          pointer-events: none;
        }

        .mb-welcome-image-wrap img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center 15%;  /* ✅ Face + clothes both visible */
        }

        .mb-welcome-close {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 5;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(0,0,0,0.10);
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          color: #222;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, color 0.2s;
        }

        .mb-welcome-close:hover {
          background: #1a1a1a;
          color: #fff;
          transform: rotate(90deg);
        }

        .mb-welcome-content {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 50px 44px;
          text-align: center;
          background: #ffffff;
        }

        .mb-welcome-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 48px;
          right: 48px;
          height: 1px;
          background: #d6b36a;
          opacity: 0.55;
        }

        .mb-welcome-eyebrow {
          margin: 0 0 20px;
          font-size: 12px;
          font-weight: 800;          /* ✅ Bold & prominent */
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1a1a1a;
        }

        .mb-welcome-eyebrow .brand-teal { color: #2f8f80; }
        .mb-welcome-eyebrow .brand-gold { color: #b5762e; }

        .mb-welcome-title {
          margin: 0;
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 33px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: -0.3px;
          color: #181818;
        }

        /* ✅ RED + ANIMATED "10% Off" */
        .mb-welcome-highlight {
          color: #c0392b;
          display: inline-block;
          animation: discountPop 1.6s infinite ease-in-out;
        }

        .mb-welcome-subtitle {
          max-width: 350px;
          margin: 20px 0 26px;
          font-size: 13px;
          line-height: 1.7;
          letter-spacing: 0.2px;
          color: #555;  /* slightly darker for readability */
        }

        .mb-welcome-code {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-width: 190px;
          margin-bottom: 26px;
          padding: 11px 18px;
          border: 1px dashed #b89052;
          border-radius: 5px;
          background: #fcfaf6;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .mb-welcome-code:hover {
          background: #f8f1e5;
          border-color: #9e7539;
          transform: translateY(-1px);
        }

        .mb-welcome-code-text {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 1.8px;
          color: #1b1b1b;
        }

        .mb-welcome-code-hint {
          font-size: 10px;
          color: #999;
          letter-spacing: 0.2px;
        }

        .mb-welcome-btn {
          min-width: 175px;
          padding: 13px 28px;
          border: 1px solid #1a1a1a;
          border-radius: 3px;
          background: #1a1a1a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s, color 0.25s, transform 0.2s;
        }

        .mb-welcome-btn:hover {
          background: #ffffff;
          color: #1a1a1a;
          transform: translateY(-1px);
        }

        /* TABLET */
        @media (max-width: 700px) {
          .mb-welcome-overlay { padding: 18px; }
          .mb-welcome-card {
            width: min(560px, 92vw);
            min-height: auto;
            grid-template-columns: 42% 58%;
          }
          .mb-welcome-image-wrap { min-height: 390px; }
          .mb-welcome-content { padding: 38px 28px 34px; }
          .mb-welcome-content::before { left: 28px; right: 28px; }
          .mb-welcome-title { font-size: 27px; }
          .mb-welcome-subtitle { font-size: 12px; }
        }

        /* MOBILE */
        @media (max-width: 560px) {
          .mb-welcome-overlay { padding: 16px; }
          .mb-welcome-card {
            width: min(360px, 92vw);
            display: flex;
            flex-direction: column;
            border-radius: 12px;
          }
          .mb-welcome-image-wrap {
            width: 100%;
            height: 155px;
            min-height: 155px;
            flex: none;
          }
          .mb-welcome-image-wrap img {
            object-position: center 20%;  /* better for mobile */
          }
          .mb-welcome-close {
            top: 10px;
            right: 10px;
            width: 30px;
            height: 30px;
            font-size: 18px;
          }
          .mb-welcome-content { padding: 27px 22px 28px; }
          .mb-welcome-content::before { left: 30px; right: 30px; }
          .mb-welcome-eyebrow {
            margin-bottom: 13px;
            font-size: 10px;
            letter-spacing: 2.5px;
          }
          .mb-welcome-title {
            font-size: 25px;
            line-height: 1.22;
          }
          .mb-welcome-subtitle {
            max-width: 290px;
            margin: 14px 0 19px;
            font-size: 12px;
            line-height: 1.55;
          }
          .mb-welcome-code {
            min-width: 180px;
            margin-bottom: 20px;
            padding: 10px 15px;
          }
          .mb-welcome-code-text { font-size: 14px; }
          .mb-welcome-code-hint { font-size: 9px; }
          .mb-welcome-btn {
            min-width: 160px;
            padding: 12px 24px;
            font-size: 10px;
          }
        }

        @media (max-width: 380px) {
          .mb-welcome-overlay { padding: 12px; }
          .mb-welcome-card { width: 94vw; }
          .mb-welcome-image-wrap {
            height: 135px;
            min-height: 135px;
          }
          .mb-welcome-image-wrap img {
            object-position: center 25%;
          }
          .mb-welcome-content { padding: 23px 17px 24px; }
          .mb-welcome-title { font-size: 21px; }
          .mb-welcome-subtitle {
            font-size: 11px;
            margin-top: 12px;
            margin-bottom: 17px;
          }
          .mb-welcome-code {
            min-width: 165px;
            margin-bottom: 17px;
          }
          .mb-welcome-btn { min-width: 150px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mb-welcome-overlay,
          .mb-welcome-card { animation: none; }
          .mb-welcome-highlight { animation: none; }
          .mb-welcome-close,
          .mb-welcome-code,
          .mb-welcome-btn { transition: none; }
        }
      `}</style>

      <div className="mb-welcome-overlay" onClick={dismiss} role="presentation">
        <div className="mb-welcome-card" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="mb-welcome-close"
            onClick={dismiss}
            aria-label="Close welcome offer"
          >
            ×
          </button>

          <div className="mb-welcome-image-wrap">
            <img src={welcomeImage} alt="MariaBeau fashion collection" />
          </div>

          <div className="mb-welcome-content">
            <div className="mb-welcome-eyebrow">
              Welcome to <span className="brand-teal">MARIA</span>
              <span className="brand-gold">BEAU</span>
            </div>

            <h2 className="mb-welcome-title">
              Enjoy <span className="mb-welcome-highlight">10% Off</span>
              <br />
              Your First Order
            </h2>

            <p className="mb-welcome-subtitle">
              A special welcome gift – just for you. Use the code below at checkout to receive 10% off your first order.
            </p>

            <div
              className="mb-welcome-code"
              onClick={handleCopyCode}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCopyCode(e);
              }}
              aria-label="Copy coupon code MAR39"
            >
              <span className="mb-welcome-code-text">MAR39</span>
              <span className="mb-welcome-code-hint">Tap to copy</span>
            </div>

            <button type="button" className="mb-welcome-btn" onClick={handleShopNow}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePopup;