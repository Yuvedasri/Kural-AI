export interface User {
  id: string;
  phoneNumber: string;
  preferredLanguage: 'tamil' | 'hindi' | 'english';
  voiceProfile?: string;
  location?: GeolocationPosition;
  village: string;
  registrationDate: Date;
  verificationStatus: 'verified' | 'unverified';
}

export interface Complaint {
  id: string;
  userId: string;
  voiceRecording?: string;
  transcribedText: string;
  category: string;
  priority: 'urgent' | 'normal' | 'low';
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  mediaFiles: string[];
  status: 'submitted' | 'verified' | 'in_progress' | 'resolved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  verificationChain: VerificationStep[];
}

export interface VerificationStep {
  level: number;
  verifierId: string;
  verifierName: string;
  verifierRole: string;
  status: 'pending' | 'approved' | 'rejected';
  responseTime?: number;
  notes?: string;
  timestamp: Date;
}

export interface Language {
  code: 'tamil' | 'hindi' | 'english';
  name: string;
  nativeName: string;
  flag: string;
}

export interface VoiceRecording {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  timestamp: Date;
}