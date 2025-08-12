import React, { useState, useEffect } from 'react';
import { BarChart, Users, AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { Complaint } from '../types';
import ComplaintCard from './ComplaintCard';
import { storage } from '../utils/localStorage';
import { notificationService } from '../utils/notificationService';
import { getTranslation } from '../utils/translations';

interface AdminDashboardProps {
  language: string;
  complaints: Complaint[];
  onComplaintClick: (complaint: Complaint) => void;
  onComplaintUpdate: (complaintId: string, updates: Partial<Complaint>) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  language,
  complaints,
  onComplaintClick,
  onComplaintUpdate
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    verified: 0,
    inProgress: 0,
    resolved: 0,
    rejected: 0,
    urgent: 0
  });

  const t = (key: string) => getTranslation(language, key);

  const handleAcceptComplaint = async (complaint: Complaint) => {
    const updates = {
      status: 'in_progress' as const,
      updatedAt: new Date(),
      verificationChain: [
        ...complaint.verificationChain,
        {
          level: complaint.verificationChain.length + 1,
          verifierId: 'admin-001',
          verifierName: 'Admin User',
          verifierRole: 'System Administrator',
          status: 'approved' as const,
          timestamp: new Date(),
          notes: 'Complaint accepted and moved to in-progress'
        }
      ]
    };

    onComplaintUpdate(complaint.id, updates);

    // Send notifications to user
    const message = `Your complaint (ID: ${complaint.id.slice(-8).toUpperCase()}) has been accepted and is now in progress.`;
    await notificationService.sendTextNotification(complaint.userId, complaint.id, 'in_progress', message);
    await notificationService.sendVoiceNotification(complaint.userId, message, language);
  };

  const handleRejectComplaint = async (complaint: Complaint) => {
    const updates = {
      status: 'rejected' as const,
      updatedAt: new Date(),
      verificationChain: [
        ...complaint.verificationChain,
        {
          level: complaint.verificationChain.length + 1,
          verifierId: 'admin-001',
          verifierName: 'Admin User',
          verifierRole: 'System Administrator',
          status: 'rejected' as const,
          timestamp: new Date(),
          notes: 'Complaint rejected after review'
        }
      ]
    };

    onComplaintUpdate(complaint.id, updates);

    // Send notifications to user
    const message = `Your complaint (ID: ${complaint.id.slice(-8).toUpperCase()}) has been reviewed and rejected. Please contact support for more information.`;
    await notificationService.sendTextNotification(complaint.userId, complaint.id, 'rejected', message);
    await notificationService.sendVoiceNotification(complaint.userId, message, language);
  };

  const handleResolveComplaint = async (complaint: Complaint) => {
    const updates = {
      status: 'resolved' as const,
      updatedAt: new Date(),
      verificationChain: [
        ...complaint.verificationChain,
        {
          level: complaint.verificationChain.length + 1,
          verifierId: 'admin-001',
          verifierName: 'Admin User',
          verifierRole: 'System Administrator',
          status: 'approved' as const,
          timestamp: new Date(),
          notes: 'Complaint resolved successfully'
        }
      ]
    };

    onComplaintUpdate(complaint.id, updates);

    // Send notifications to user
    const message = `Great news! Your complaint (ID: ${complaint.id.slice(-8).toUpperCase()}) has been resolved. Thank you for using KuralAI.`;
    await notificationService.sendTextNotification(complaint.userId, complaint.id, 'resolved', message);
    await notificationService.sendVoiceNotification(complaint.userId, message, language);
  };

  useEffect(() => {
    const calculateStats = () => {
      const total = complaints.length;
      const submitted = complaints.filter(c => c.status === 'submitted').length;
      const verified = complaints.filter(c => c.status === 'verified').length;
      const inProgress = complaints.filter(c => c.status === 'in_progress').length;
      const resolved = complaints.filter(c => c.status === 'resolved').length;
      const rejected = complaints.filter(c => c.status === 'rejected').length;
      const urgent = complaints.filter(c => c.priority === 'urgent').length;

      setStats({
        total,
        submitted,
        verified,
        inProgress,
        resolved,
        rejected,
        urgent
      });
    };

    calculateStats();
  }, [complaints]);

  const filteredComplaints = complaints.filter(complaint => {
    const statusMatch = filterStatus === 'all' || complaint.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || complaint.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const StatCard = ({ icon, title, value, color = 'blue' }: any) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-l-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-3 mb-2">
          <BarChart size={28} className="text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            {t('adminDashboard') || 'Administrative Dashboard'}
          </h1>
        </div>
        <p className="text-gray-600">
          {t('manageGrievances') || 'Manage and monitor village grievances'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users size={24} className="text-blue-600" />}
         title={t('totalComplaints') || 'Total Complaints'}
          value={stats.total}
          color="blue"
        />
        
        <StatCard
          icon={<AlertCircle size={24} className="text-yellow-600" />}
         title={t('pendingReview') || 'Pending Review'}
          value={stats.submitted}
          color="yellow"
        />
        
        <StatCard
          icon={<Clock size={24} className="text-purple-600" />}
         title={t('inProgress') || 'In Progress'}
          value={stats.inProgress}
          color="purple"
        />
        
        <StatCard
          icon={<CheckCircle size={24} className="text-green-600" />}
         title={t('resolved') || 'Resolved'}
          value={stats.resolved}
          color="green"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp size={20} className="text-red-600" />
            <h3 className="text-lg font-semibold text-gray-800">{t('urgentComplaints') || 'Urgent Complaints'}</h3>
          </div>
          <div className="text-3xl font-bold text-red-600">{stats.urgent}</div>
          <div className="text-sm text-gray-600 mt-2">
            {stats.total > 0 ? Math.round((stats.urgent / stats.total) * 100) : 0}% of total complaints
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CheckCircle size={20} className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">{t('resolutionRate') || 'Resolution Rate'}</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {stats.resolved} of {stats.total} complaints resolved
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">{t('avgResponse') || 'Average Response'}</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600">2.3</div>
          <div className="text-sm text-gray-600 mt-2">
            Days average response time
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('filterComplaints') || 'Filter Complaints'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('status') || 'Status'}
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('allStatus') || 'All Status'}</option>
              <option value="submitted">{t('submitted')}</option>
              <option value="verified">{t('verified')}</option>
              <option value="in_progress">{t('inProgress')}</option>
              <option value="resolved">{t('resolved')}</option>
              <option value="rejected">{t('rejected')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('priority')}
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">{t('allPriorities') || 'All Priorities'}</option>
              <option value="urgent">{t('urgent')}</option>
              <option value="normal">{t('normal')}</option>
              <option value="low">{t('low')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">
            {t('recentComplaints') || 'Recent Complaints'} ({filteredComplaints.length})
          </h3>
        </div>

        {filteredComplaints.length > 0 ? (
          <div className="space-y-4">
            {filteredComplaints
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((complaint) => (
                <div
                  key={complaint.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                      <ComplaintCard
                        complaint={complaint}
                        language={language}
                        onClick={() => onComplaintClick(complaint)}
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Admin Actions
                      </div>
                      
                      {complaint.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => handleAcceptComplaint(complaint)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ✓ Accept
                          </button>
                          <button
                            onClick={() => handleRejectComplaint(complaint)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            ✗ Reject
                          </button>
                        </>
                      )}
                      
                      {complaint.status === 'in_progress' && (
                        <button
                          onClick={() => handleResolveComplaint(complaint)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          ✓ Mark Resolved
                        </button>
                      )}
                      
                      {(complaint.status === 'resolved' || complaint.status === 'rejected') && (
                        <div className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
                          {complaint.status === 'resolved' ? '✓ Resolved' : '✗ Rejected'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">{t('noComplaintsFound') || 'No complaints found matching the current filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;