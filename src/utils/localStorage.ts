import { User, Complaint } from '../types';

export const StorageKeys = {
  USER: 'kural_ai_user',
  COMPLAINTS: 'kural_ai_complaints',
  LANGUAGE: 'kural_ai_language',
  VOICE_RECORDINGS: 'kural_ai_voice_recordings'
};

export const storage = {
  // User management
  getUser: (): User | null => {
    try {
      const userData = localStorage.getItem(StorageKeys.USER);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
  },

  removeUser: (): void => {
    localStorage.removeItem(StorageKeys.USER);
  },

  // Complaints management
  getComplaints: (): Complaint[] => {
    try {
      const complaintsData = localStorage.getItem(StorageKeys.COMPLAINTS);
      return complaintsData ? JSON.parse(complaintsData) : [];
    } catch {
      return [];
    }
  },

  setComplaints: (complaints: Complaint[]): void => {
    localStorage.setItem(StorageKeys.COMPLAINTS, JSON.stringify(complaints));
  },

  addComplaint: (complaint: Complaint): void => {
    const complaints = storage.getComplaints();
    complaints.push(complaint);
    storage.setComplaints(complaints);
  },

  updateComplaint: (id: string, updates: Partial<Complaint>): void => {
    const complaints = storage.getComplaints();
    const index = complaints.findIndex(c => c.id === id);
    if (index !== -1) {
      complaints[index] = { ...complaints[index], ...updates, updatedAt: new Date() };
      storage.setComplaints(complaints);
    }
  },

  // Language preference
  getLanguage: (): string => {
    return localStorage.getItem(StorageKeys.LANGUAGE) || 'english';
  },

  setLanguage: (language: string): void => {
    localStorage.setItem(StorageKeys.LANGUAGE, language);
  },

  // Voice recordings
  getVoiceRecordings: (): any[] => {
    try {
      const recordings = localStorage.getItem(StorageKeys.VOICE_RECORDINGS);
      return recordings ? JSON.parse(recordings) : [];
    } catch {
      return [];
    }
  },

  addVoiceRecording: (recording: any): void => {
    const recordings = storage.getVoiceRecordings();
    recordings.push(recording);
    localStorage.setItem(StorageKeys.VOICE_RECORDINGS, JSON.stringify(recordings));
  }
};