import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// ✅ Replace this file to change the popup image — nothing else needs to change.
import welcomeImage from '../assets/welcome-popup.jpg';

// Once shown (or closed, or "Shop Now" clicked), never show again on this device.
const STORAGE_KEY = 'mariabeau_welcome_popup_shown';
const SHOW_DELAY_MS = 6000; // ~6 seconds after the visitor lands

function WelcomePopup() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Already shown before on this browser — never show again.
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  };

  const handleShopNow = () => {
    dismiss();
    navigate('/');
  };

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText('WELCOME10').then(() => {
        toast.success('Code copied: WELCOME10');
      }).catch(() => {});
    }
  };

  if (!visible) return null;

  return (
    <>
      {/* Scoped styles for the popup — media queries need a <style> tag since inline styles can't do them */}
      <style>{`
        .mb-welcome-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26, 26, 26, 0.55);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: mbWelcomeFadeIn 0.3s ease;
        }
        @keyframes mbWelcomeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mbWelcomeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mb-welcome-card {
          background: #ffffff;
          border-radius: 8px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.22);
          max-width: 560px;
          width: 100%;
          display: flex;
          overflow: hidden;
          position: relative;
          animation: mbWelcomeSlideUp 0.35s ease;
        }
        .mb-welcome-image-wrap {
          flex: 0 0 40%;
        }
        .mb-welcome-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .mb-welcome-content {
          flex: 0 0 60%;
          padding: 32px 30px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        .mb-welcome-close {
          position: absolute;
          top: 10px;
          right: 12px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          color: #999;
          z-index: 2;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .mb-welcome-close:hover {
          color: #1a1a1a;
          background: #faf7f2;
        }
        .mb-welcome-eyebrow {
          font-size: 11px;
          letter-spacing: 1.8px;
          color: #B5762E;
          font-weight: 700;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .mb-welcome-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 21px;
          color: #1a1a1a;
          margin: 0 0 10px 0;
          line-height: 1.3;
        }
        .mb-welcome-subtitle {
          font-size: 13px;
          color: #777;
          line-height: 1.5;
          margin: 0 0 18px 0;
        }
        .mb-welcome-code {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #faf7f2;
          border: 1px dashed #B5762E;
          border-radius: 5px;
          padding: 9px 16px;
          margin: 0 auto 18px auto;
          cursor: pointer;
        }
        .mb-welcome-code-text {
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 1.2px;
          color: #1a1a1a;
        }
        .mb-welcome-code-hint {
          font-size: 10px;
          color: #aaa;
        }
        .mb-welcome-btn {
          background: #1a1a1a;
          color: #ffffff;
          border: none;
          padding: 11px 30px;
          font-size: 12px;
          letter-spacing: 1.2px;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          align-self: center;
          transition: background 0.2s ease;
        }
        .mb-welcome-btn:hover {
          background: #2FA88E;
        }

        @media (max-width: 620px) {
          .mb-welcome-card {
            flex-direction: column;
            max-width: 340px;
          }
          .mb-welcome-image-wrap {
            flex: none;
            width: 100%;
            height: 170px;
          }
          .mb-welcome-content {
            flex: none;
            padding: 22px 20px 24px 20px;
          }
          .mb-welcome-title {
            font-size: 18px;
          }
        }
        @media (max-width: 360px) {
          .mb-welcome-image-wrap {
            height: 150px;
          }
          .mb-welcome-content {
            padding: 18px 16px 20px 16px;
          }
          .mb-welcome-title {
            font-size: 17px;
          }
        }
      `}</style>

      <div className="mb-welcome-overlay" onClick={dismiss}>
        <div className="mb-welcome-card" onClick={(e) => e.stopPropagation()}>
          <button className="mb-welcome-close" onClick={dismiss} aria-label="Close welcome offer">
            ×
          </button>

          <div className="mb-welcome-image-wrap">
            <img src={welcomeImage} alt="MariaBeau" />
          </div>

          <div className="mb-welcome-content">
            <span className="mb-welcome-eyebrow">Welcome to MariaBeau</span>
            <h2 className="mb-welcome-title">Enjoy 10% Off<br />Your First Order</h2>
            <p className="mb-welcome-subtitle">
              As a thank you for visiting, treat yourself to something beautiful — on us.
            </p>

            <div className="mb-welcome-code" onClick={handleCopyCode}>
              <span className="mb-welcome-code-text">WELCOME10</span>
              <span className="mb-welcome-code-hint">(tap to copy)</span>
            </div>

            <button className="mb-welcome-btn" onClick={handleShopNow}>
              Shop Now
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WelcomePopup;