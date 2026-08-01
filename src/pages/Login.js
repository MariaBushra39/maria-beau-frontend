import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();  // ✅ Context se login function lo
  const navigate = useNavigate();

  console.log('✅ Login component rendered successfully!');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🟢 Submit button CLICKED! Form submitted.');
    setLoading(true);

    try {
      console.log('📡 Calling login function from AuthContext...');
      const result = await login(email, password);  // ✅ Bas email aur password do
      console.log('📥 Login result:', result);

      if (result.success) {
        console.log('✅ Login successful! Redirecting...');
        toast.success('Welcome back!');
        navigate('/');
      } else {
        console.log('❌ Login failed:', result.error);
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      console.log('🔥 Unexpected error:', error);
      toast.error('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your account</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
              <span className="toggle-eye" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="remember-row">
            <label className="remember-label">
              <input type="checkbox" /> Remember me
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;