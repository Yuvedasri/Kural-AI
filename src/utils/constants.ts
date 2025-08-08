export const LANGUAGES: Record<string, any> = {
  tamil: {
    code: 'tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    flag: '🇮🇳',
    locale: 'ta-IN'
  },
  hindi: {
    code: 'hindi',
    name: 'Hindi',
    nativeName: 'हिंदी',
    flag: '🇮🇳',
    locale: 'hi-IN'
  },
  english: {
    code: 'english',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    locale: 'en-US'
  }
};

export const COMPLAINT_CATEGORIES = {
  tamil: [
    'நீர் வழங்கல்', 'சாலை மற்றும் போக்குவரத்து', 'மின்சாரம்', 
    'சுகாதாரம்', 'கல்வி', 'பொது பாதுகாப்பு', 'அரசு சேவைகள்', 'பிற'
  ],
  hindi: [
    'जल आपूर्ति', 'सड़क और परिवहन', 'बिजली', 
    'स्वास्थ्य', 'शिक्षा', 'सार्वजनिक सुरक्षा', 'सरकारी सेवाएं', 'अन्य'
  ],
  english: [
    'Water Supply', 'Roads & Transportation', 'Electricity',
    'Healthcare', 'Education', 'Public Safety', 'Government Services', 'Others'
  ]
};

export const PRIORITY_LEVELS = {
  tamil: {
    urgent: 'அவசர',
    normal: 'சாதாரண',
    low: 'குறைந்த'
  },
  hindi: {
    urgent: 'तत्काल',
    normal: 'सामान्य',
    low: 'कम'
  },
  english: {
    urgent: 'Urgent',
    normal: 'Normal',
    low: 'Low'
  }
};

export const STATUS_LABELS = {
  tamil: {
    submitted: 'சமர்ப்பிக்கப்பட்டது',
    verified: 'சரிபார்க்கப்பட்டது',
    in_progress: 'முன்னேற்றத்தில்',
    resolved: 'தீர்க்கப்பட்டது',
    rejected: 'நிராகரிக்கப்பட்டது'
  },
  hindi: {
    submitted: 'प्रस्तुत',
    verified: 'सत्यापित',
    in_progress: 'प्रगतिशील',
    resolved: 'हल हो गया',
    rejected: 'अस्वीकृत'
  },
  english: {
    submitted: 'Submitted',
    verified: 'Verified',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    rejected: 'Rejected'
  }
};

export const VERIFIER_ROLES = {
  tamil: [
    'ஆசிரியர்', 'சுய உதவி குழு தலைவர்', 'கிராம தலைவர்', 
    'பஞ்சாயத்து உறுப்பினர்', 'போலீஸ்', 'மருத்துவர்'
  ],
  hindi: [
    'शिक्षक', 'स्वयं सहायता समूह प्रमुख', 'ग्राम प्रधान',
    'पंचायत सदस्य', 'पुलिस', 'डॉक्टर'
  ],
  english: [
    'Teacher', 'SHG Leader', 'Village Head', 
    'Panchayat Member', 'Police', 'Doctor'
  ]
};