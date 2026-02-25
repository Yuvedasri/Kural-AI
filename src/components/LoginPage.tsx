import React, { useState } from 'react';
import { Phone, Shield, ArrowRight, Lock } from 'lucide-react';
import api from '../api/axios';
import { getTranslation } from '../utils/translations';
import { User } from '../types';

interface LoginPageProps {
  language: string;
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ language, onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = (key: string) => getTranslation(language, key);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !password.trim()) {
      setError(t('invalidPhone') || 'Please enter valid details');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { phone: phoneNumber, password });

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);

        const user: User = {
          id: response.data._id,
          phoneNumber: response.data.phone,
          preferredLanguage: language as any,
          village: 'Thanjavur Village', // default
          registrationDate: new Date(),
          verificationStatus: 'verified'
        };

        onLogin(user);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {t('welcome')}
          </h1>
          <p className="text-gray-600">
            {t('loginSubtitle')}
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('phoneNumber')} *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone size={20} className="text-gray-400" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                placeholder={t('enterPhone')}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                maxLength={10}
              />
            </div>
            <div className="mt-2 text-sm text-gray-500">
              Format: 10-digit mobile number
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={20} className="text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || phoneNumber.length !== 10 || !password}
            className="w-full flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium text-lg transition-colors"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Shield size={20} />
                <span>Login</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default LoginPage;