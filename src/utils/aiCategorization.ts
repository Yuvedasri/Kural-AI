// AI-powered complaint categorization based on voice transcription
export interface AISuggestion {
  category: string;
  priority: 'urgent' | 'normal' | 'low';
  confidence: number;
  keywords: string[];
}

// Keywords for different categories in multiple languages
const categoryKeywords = {
  'Water Supply': {
    tamil: ['நீர்', 'தண்ணீர்', 'குழாய்', 'கிணறு', 'தொட்டி', 'பம்ப்'],
    hindi: ['पानी', 'नल', 'कुआं', 'टंकी', 'पंप', 'जल'],
    english: ['water', 'tap', 'well', 'tank', 'pump', 'supply', 'leak', 'shortage']
  },
  'Roads & Transportation': {
    tamil: ['சாலை', 'பஸ்', 'வாகனம்', 'போக்குவரத்து', 'குழி'],
    hindi: ['सड़क', 'बस', 'गाड़ी', 'यातायात', 'गड्ढा'],
    english: ['road', 'bus', 'vehicle', 'transport', 'pothole', 'traffic', 'bridge']
  },
  'Electricity': {
    tamil: ['மின்சாரம்', 'கரண்ட்', 'விளக்கு', 'மின்கம்பம்'],
    hindi: ['बिजली', 'करंट', 'लाइट', 'खंभा'],
    english: ['electricity', 'power', 'light', 'pole', 'outage', 'wire', 'transformer']
  },
  'Healthcare': {
    tamil: ['மருத்துவம்', 'மருந்து', 'மருத்துவர்', 'ஆஸ்பத்திரி'],
    hindi: ['दवा', 'डॉक्टर', 'अस्पताल', 'इलाज'],
    english: ['medicine', 'doctor', 'hospital', 'health', 'clinic', 'treatment']
  },
  'Education': {
    tamil: ['கல்வி', 'பள்ளி', 'ஆசிரியர்', 'புத்தகம்'],
    hindi: ['शिक्षा', 'स्कूल', 'शिक्षक', 'किताब'],
    english: ['education', 'school', 'teacher', 'book', 'class', 'student']
  },
  'Public Safety': {
    tamil: ['பாதுகாப்பு', 'போலீஸ்', 'திருட்டு', 'அபாயம்'],
    hindi: ['सुरक्षा', 'पुलिस', 'चोरी', 'खतरा'],
    english: ['safety', 'police', 'theft', 'danger', 'crime', 'security']
  }
};

// Priority keywords
const priorityKeywords = {
  urgent: {
    tamil: ['அவசர', 'உடனடி', 'முக்கியம்', 'ஆபத்து'],
    hindi: ['तत्काल', 'जरूरी', 'महत्वपूर्ण', 'खतरा'],
    english: ['urgent', 'emergency', 'immediate', 'critical', 'danger', 'serious']
  },
  normal: {
    tamil: ['சாதாரண', 'நல்ல'],
    hindi: ['सामान्य', 'ठीक'],
    english: ['normal', 'regular', 'standard', 'okay']
  },
  low: {
    tamil: ['குறைந்த', 'சிறிய'],
    hindi: ['कम', 'छोटा'],
    english: ['low', 'minor', 'small', 'less']
  }
};

export function categorizeComplaint(transcribedText: string, language: string = 'english'): AISuggestion {
  const text = transcribedText.toLowerCase();
  let bestCategory = 'Others';
  let bestPriority: 'urgent' | 'normal' | 'low' = 'normal';
  let maxScore = 0;
  let foundKeywords: string[] = [];

  // Analyze category
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    const langKeywords = keywords[language as keyof typeof keywords] || keywords.english;
    let score = 0;
    const matchedKeywords: string[] = [];

    langKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
      foundKeywords = matchedKeywords;
    }
  });

  // Analyze priority
  let priorityScore = { urgent: 0, normal: 0, low: 0 };
  
  Object.entries(priorityKeywords).forEach(([priority, keywords]) => {
    const langKeywords = keywords[language as keyof typeof keywords] || keywords.english;
    langKeywords.forEach(keyword => {
      if (text.includes(keyword.toLowerCase())) {
        priorityScore[priority as keyof typeof priorityScore] += 1;
      }
    });
  });

  // Determine priority
  const maxPriorityScore = Math.max(...Object.values(priorityScore));
  if (maxPriorityScore > 0) {
    bestPriority = Object.entries(priorityScore).find(([_, score]) => score === maxPriorityScore)?.[0] as any || 'normal';
  }

  // Calculate confidence based on keyword matches
  const confidence = Math.min((maxScore / 3) * 100, 100);

  return {
    category: bestCategory,
    priority: bestPriority,
    confidence,
    keywords: foundKeywords
  };
}

// Simulate AI processing delay
export async function analyzeComplaintWithAI(transcribedText: string, language: string = 'english'): Promise<AISuggestion> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return categorizeComplaint(transcribedText, language);
}