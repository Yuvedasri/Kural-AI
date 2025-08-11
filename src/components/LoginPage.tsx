import React, { useState } from 'react';
import { Phone, Shield, ArrowRight, RotateCcw } from 'lucide-react';
import { otpService } from '../utils/otpService';
import { getTranslation } from '../utils/translations';
import { User } from '../types';

interface LoginPageProps {
  language: string;
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ language, onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentOtp, setSentOtp] = useState('');

  const t = (key: string) => getTranslation(language, key);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      setError(t('invalidPhone'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await otpService.sendOTP(phoneNumber);
      
      if (response.success) {
        setStep('otp');
        setSentOtp(response.otp || ''); // For demo purposes
        // Show OTP in alert for demo
        if (response.otp) {
          alert(`Demo OTP: ${response.otp}`);
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError(t('invalidOtp'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await otpService.verifyOTP(phoneNumber, otp);
      
      if (response.success && response.user) {
        // Create user object
        const user: User = {
          id: response.user.id,
          phoneNumber: response.user.phoneNumber,
          preferredLanguage: language as any,
          village: 'Thanjavur Village', // Default village
          registrationDate: new Date(),
          verificationStatus: 'verified'
        };
        
        onLogin(user);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setError('');
    await handleSendOTP();
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
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

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {step === 'phone' ? (
            <>
              {/* Phone Number Step */}
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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleSendOTP}
                disabled={loading || phoneNumber.length !== 10}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl font-medium text-lg transition-colors"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Shield size={20} />
                    <span>{t('sendOtp')}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* OTP Verification Step */}
              <div className="mb-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield size={24} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {t('otpSent')}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sent to {phoneNumber}
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('enterOtp')} *
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                />
                <div className="mt-2 text-sm text-gray-500 text-center">
                  Enter the 6-digit code sent to your phone
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.length !== 6}
                  className="w-full flex items-center justify-center space-x-2 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium text-lg transition-colors"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield size={20} />
                      <span>{t('verifyLogin')}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 rounded-xl font-medium transition-colors"
                >
                  <RotateCcw size={18} />
                  <span>{t('resendOtp')}</span>
                </button>

                <button
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                    setError('');
                  }}
                  className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Change phone number
                </button>
              </div>
            </>
          )}
        </div>

        {/* Demo Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> Use any 10-digit phone number. The OTP will be shown in an alert for testing.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;