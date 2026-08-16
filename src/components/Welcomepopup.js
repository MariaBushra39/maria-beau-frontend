import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

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
          background: rgba(26, 26, 26, 0.62);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: mbWelcomeFadeIn 0.35s ease;
        }
        @keyframes mbWelcomeFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mbWelcomeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mb-welcome-card {
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.28);
          max-width: 780px;
          width: 100%;
          display: flex;
          overflow: hidden;
          position: relative;
          animation: mbWelcomeSlideUp 0.4s ease;
        }
        .mb-welcome-image {
          flex: 0 0 42%;
          min-height: 380px;
          background-size: cover;
          background-position: center top;
        }
        .mb-welcome-content {
          flex: 1;
          padding: 44px 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          text-align: center;
        }
        .mb-welcome-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.92);
          border: 1px solid #e8dcc4;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
          color: #1a1a1a;
          z-index: 2;
          transition: background 0.2s ease;
        }
        .mb-welcome-close:hover {
          background: #faf7f2;
        }
        .mb-welcome-eyebrow {
          font-size: 12px;
          letter-spacing: 2px;
          color: #B5762E;
          font-weight: 700;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .mb-welcome-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 27px;
          color: #1a1a1a;
          margin: 0 0 14px 0;
          line-height: 1.3;
        }
        .mb-welcome-subtitle {
          font-size: 14.5px;
          color: #666;
          line-height: 1.6;
          margin: 0 0 26px 0;
        }
        .mb-welcome-code {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #faf7f2;
          border: 1.5px dashed #B5762E;
          border-radius: 6px;
          padding: 12px 22px;
          margin: 0 auto 28px auto;
          cursor: pointer;
        }
        .mb-welcome-code-text {
          font-size: 17px;
          font-weight: 700;
          letter-spacing: 1.5px;
          color: #1a1a1a;
        }
        .mb-welcome-code-hint {
          font-size: 11px;
          color: #999;
        }
        .mb-welcome-btn {
          background: #1a1a1a;
          color: #ffffff;
          border: none;
          padding: 14px 38px;
          font-size: 13px;
          letter-spacing: 1.5px;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          align-self: center;
          transition: background 0.2s ease;
        }
        .mb-welcome-btn:hover {
          background: #2FA88E;
        }

        @media (max-width: 700px) {
          .mb-welcome-card {
            flex-direction: column;
            max-width: 420px;
            max-height: 92vh;
            overflow-y: auto;
          }
          .mb-welcome-image {
            flex: none;
            width: 100%;
            min-height: 200px;
          }
          .mb-welcome-content {
            padding: 30px 24px 28px 24px;
          }
          .mb-welcome-title {
            font-size: 21px;
          }
        }
        @media (max-width: 380px) {
          .mb-welcome-title {
            font-size: 18px;
          }
          .mb-welcome-content {
            padding: 24px 16px 20px 16px;
          }
          .mb-welcome-code {
            padding: 10px 16px;
          }
          .mb-welcome-btn {
            padding: 12px 28px;
          }
        }
      `}</style>

      <div className="mb-welcome-overlay" onClick={dismiss}>
        <div className="mb-welcome-card" onClick={(e) => e.stopPropagation()}>
          <button className="mb-welcome-close" onClick={dismiss} aria-label="Close welcome offer">
            ×
          </button>

          <div
            className="mb-welcome-image"
            style={{
              backgroundImage: `url(https://images.pexels.com/photos/30156603/pexels-photo-30156603.jpeg?auto=compress&cs=tinysrgb&w=800)`
            }}
          />

          <div className="mb-welcome-content">
            <span className="mb-welcome-eyebrow">Welcome to MARIABEAU</span>
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