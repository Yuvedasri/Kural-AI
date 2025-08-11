// OTP Service for phone number verification
export interface OTPResponse {
  success: boolean;
  message: string;
  otp?: string; // Only for demo purposes
}

export interface OTPVerification {
  success: boolean;
  message: string;
  user?: {
    id: string;
    phoneNumber: string;
    isNewUser: boolean;
  };
}

class OTPService {
  private otpStore: Map<string, { otp: string; timestamp: number; attempts: number }> = new Map();
  private readonly OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;

  // Generate 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber: string): Promise<OTPResponse> {
    try {
      // Validate phone number format
      if (!this.isValidPhoneNumber(phoneNumber)) {
        return {
          success: false,
          message: 'Invalid phone number format'
        };
      }

      const otp = this.generateOTP();
      const timestamp = Date.now();

      // Store OTP with timestamp and reset attempts
      this.otpStore.set(phoneNumber, {
        otp,
        timestamp,
        attempts: 0
      });

      // In production, integrate with SMS service like Twilio, AWS SNS, etc.
      console.log(`OTP for ${phoneNumber}: ${otp}`);

      return {
        success: true,
        message: 'OTP sent successfully',
        otp // Only for demo - remove in production
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.'
      };
    }
  }

  // Verify OTP
  async verifyOTP(phoneNumber: string, enteredOTP: string): Promise<OTPVerification> {
    try {
      const otpData = this.otpStore.get(phoneNumber);

      if (!otpData) {
        return {
          success: false,
          message: 'OTP not found. Please request a new OTP.'
        };
      }

      // Check if OTP has expired
      if (Date.now() - otpData.timestamp > this.OTP_EXPIRY) {
        this.otpStore.delete(phoneNumber);
        return {
          success: false,
          message: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check attempts
      if (otpData.attempts >= this.MAX_ATTEMPTS) {
        this.otpStore.delete(phoneNumber);
        return {
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.'
        };
      }

      // Verify OTP
      if (otpData.otp === enteredOTP) {
        this.otpStore.delete(phoneNumber);
        
        // Check if user exists (in production, check database)
        const isNewUser = !this.userExists(phoneNumber);
        
        return {
          success: true,
          message: 'OTP verified successfully',
          user: {
            id: `user_${phoneNumber}`,
            phoneNumber,
            isNewUser
          }
        };
      } else {
        // Increment attempts
        otpData.attempts += 1;
        this.otpStore.set(phoneNumber, otpData);
        
        return {
          success: false,
          message: `Invalid OTP. ${this.MAX_ATTEMPTS - otpData.attempts} attempts remaining.`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Verification failed. Please try again.'
      };
    }
  }

  // Validate phone number format
  private isValidPhoneNumber(phoneNumber: string): boolean {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Indian mobile number (10 digits)
    return digits.length === 10 && /^[6-9]/.test(digits);
  }

  // Check if user exists (mock implementation)
  private userExists(phoneNumber: string): boolean {
    // In production, check against database
    const existingUsers = JSON.parse(localStorage.getItem('kural_ai_users') || '[]');
    return existingUsers.some((user: any) => user.phoneNumber === phoneNumber);
  }

  // Clean expired OTPs
  cleanExpiredOTPs(): void {
    const now = Date.now();
    for (const [phoneNumber, otpData] of this.otpStore.entries()) {
      if (now - otpData.timestamp > this.OTP_EXPIRY) {
        this.otpStore.delete(phoneNumber);
      }
    }
  }
}

export const otpService = new OTPService();

// Clean expired OTPs every minute
setInterval(() => {
  otpService.cleanExpiredOTPs();
}, 60000);