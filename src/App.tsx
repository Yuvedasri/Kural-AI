import React, { useState, useEffect } from 'react';
import { Plus, Home, Settings, BarChart, List, User, Menu, X, LogOut } from 'lucide-react';
import LoginPage from './components/LoginPage';
import LanguageSelector from './components/LanguageSelector';
import ComplaintForm from './components/ComplaintForm';
import ComplaintCard from './components/ComplaintCard';
import ComplaintDetail from './components/ComplaintDetail';
import AdminDashboard from './components/AdminDashboard';
import { User as UserType, Complaint } from './types';
import { storage } from './utils/localStorage';
import { LANGUAGES } from './utils/constants';
import { getTranslation } from './utils/translations';

function App() {
  const [currentLanguage, setCurrentLanguage] = useState('english');
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'file' | 'track' | 'admin'>('home');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const t = (key: string) => getTranslation(currentLanguage, key);

  useEffect(() => {
    const storedUser = storage.getUser();
    if (storedUser) {
      setUser(storedUser);
      setIsLoggedIn(true);
      setCurrentLanguage(storedUser.preferredLanguage);
    }

    // Load complaints
    const storedComplaints = storage.getComplaints();
    setComplaints(storedComplaints);

    // Load language preference
    const storedLanguage = storage.getLanguage();
    setCurrentLanguage(storedLanguage);
  }, []);

  const handleLogin = (user: UserType) => {
    setUser(user);
    setIsLoggedIn(true);
    storage.setUser(user);
    setCurrentLanguage(user.preferredLanguage);
    storage.setLanguage(user.preferredLanguage);
  };

  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
    storage.removeUser();
    setComplaints([]);
    setActiveTab('home');
    setSelectedComplaint(null);
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    storage.setLanguage(language);
    if (user) {
      const updatedUser = { ...user, preferredLanguage: language as any };
      setUser(updatedUser);
      storage.setUser(updatedUser);
    }
  };

  const handleComplaintSubmit = async (complaintData: any) => {
    if (!user) return;

    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newComplaint: Complaint = {
        id: `complaint-${Date.now()}`,
        userId: user.id,
        voiceRecording: complaintData.voiceRecording ? URL.createObjectURL(complaintData.voiceRecording) : undefined,
        transcribedText: complaintData.transcribedText,
        category: complaintData.category,
        priority: complaintData.priority,
        location: {
          latitude: complaintData.location.latitude,
          longitude: complaintData.location.longitude,
          address: complaintData.location.address
        },
        mediaFiles: complaintData.images?.map((img: File) => URL.createObjectURL(img)) || [],
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date(),
        verificationChain: [
          {
            level: 1,
            verifierId: 'verifier-001',
            verifierName: 'Priya Sharma',
            verifierRole: 'Village Teacher',
            status: 'pending',
            timestamp: new Date()
          }
        ]
      };

      storage.addComplaint(newComplaint);
      setComplaints(prev => [...prev, newComplaint]);
      setActiveTab('track');
      
      // Show success message
      alert(t('complaintSubmitted'));
    } catch (error) {
      console.error('Failed to submit complaint:', error);
      alert('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTabContent = () => {
    if (selectedComplaint) {
      return (
        <ComplaintDetail
          complaint={selectedComplaint}
          language={currentLanguage}
          onBack={() => setSelectedComplaint(null)}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeTab language={currentLanguage} />;
      case 'file':
        return (
          <ComplaintForm
            language={currentLanguage}
            onSubmit={handleComplaintSubmit}
            isSubmitting={isSubmitting}
          />
        );
      case 'track':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">{t('myComplaints') || 'My Complaints'}</h2>
              <p className="text-gray-600">{t('trackStatus') || 'Track the status of your submitted complaints'}</p>
            </div>
            
            {complaints.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {complaints
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((complaint) => (
                    <ComplaintCard
                      key={complaint.id}
                      complaint={complaint}
                      language={currentLanguage}
                      onClick={() => setSelectedComplaint(complaint)}
                    />
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <List size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">{t('noComplaints')}</p>
                <button
                  onClick={() => setActiveTab('file')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {t('fileFirstComplaint')}
                </button>
              </div>
            )}
          </div>
        );
      case 'admin':
        return (
          <AdminDashboard
            language={currentLanguage}
            complaints={complaints}
            onComplaintClick={setSelectedComplaint}
          />
        );
      default:
        return <HomeTab language={currentLanguage} />;
    }
  };

  // Show login page if not logged in
  if (!isLoggedIn) {
    return (
      <LoginPage 
        language={currentLanguage} 
        onLogin={handleLogin}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">KuralAI</h1>
                <p className="text-xs text-gray-600">{t('systemSubtitle') || 'Voice-Powered Grievance System'}</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => {setActiveTab('home'); setSelectedComplaint(null);}}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <Home size={20} />
                <span>{t('home')}</span>
              </button>

              <button
                onClick={() => {setActiveTab('file'); setSelectedComplaint(null);}}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'file' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <Plus size={20} />
                <span>{t('fileComplaint')}</span>
              </button>

              <button
                onClick={() => {setActiveTab('track'); setSelectedComplaint(null);}}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'track' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <List size={20} />
                <span>{t('track')}</span>
              </button>

              <button
                onClick={() => {setActiveTab('admin'); setSelectedComplaint(null);}}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'admin' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <BarChart size={20} />
                <span>{t('admin')}</span>
              </button>
            </nav>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                isOpen={languageSelectorOpen}
                onToggle={() => setLanguageSelectorOpen(!languageSelectorOpen)}
              />

              <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User size={16} className="text-gray-600" />
                <span className="text-sm text-gray-700">{user?.village}</span>
              </div>

              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={16} />
                <span className="text-sm font-medium">{t('logout')}</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {[
                { key: 'home', icon: Home, label: t('home') },
                { key: 'file', icon: Plus, label: t('fileComplaint') },
                { key: 'track', icon: List, label: t('track') },
                { key: 'admin', icon: BarChart, label: t('admin') }
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key as any);
                    setSelectedComplaint(null);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                    activeTab === key ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </button>
              ))}
              
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <User size={16} className="text-gray-600" />
                  <span className="text-sm text-gray-700">{user?.village}</span>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-medium">{t('logout')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getTabContent()}
      </main>

      {/* Floating Action Button (Mobile) */}
      {activeTab !== 'file' && !selectedComplaint && (
        <button
          onClick={() => setActiveTab('file')}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-30"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}

const HomeTab: React.FC<{ language: string }> = ({ language }) => {
  const t = (key: string) => getTranslation(language, key);
  
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          {t('welcomeTitle')}
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          {t('welcomeSubtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-lg transition-colors">
            {t('fileComplaint')}
          </button>
          <button className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-lg transition-colors">
            Learn How It Works
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings size={32} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {t('voicePowered')}
          </h3>
          <p className="text-gray-600">
            {t('voicePoweredDesc')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {t('communityVerified')}
          </h3>
          <p className="text-gray-600">
            {t('communityVerifiedDesc')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart size={32} className="text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            {t('realTimeTracking')}
          </h3>
          <p className="text-gray-600">
            {t('realTimeTrackingDesc')}
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          How KuralAI Works
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: 1, title: 'Record Voice', desc: 'Speak your complaint in your preferred language' },
            { step: 2, title: 'Add Location', desc: 'Automatically capture the issue location with GPS' },
            { step: 3, title: 'Community Review', desc: 'Trusted verifiers review and validate your complaint' },
            { step: 4, title: 'Resolution', desc: 'Get updates and track progress until resolution' }
          ].map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                {step}
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{title}</h4>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-xl text-white p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold mb-2">1,247</div>
            <div className="text-blue-100">Complaints Filed</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">89%</div>
            <div className="text-blue-100">Resolution Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">2.3</div>
            <div className="text-blue-100">Days Avg Response</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">156</div>
            <div className="text-blue-100">Active Villages</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;