import React from 'react';
import { Clock, MapPin, AlertCircle, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Complaint } from '../types';
import { STATUS_LABELS, PRIORITY_LEVELS } from '../utils/constants';

interface ComplaintCardProps {
  complaint: Complaint;
  language: string;
  onClick?: () => void;
}

const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  language,
  onClick
}) => {
  const statusLabels = STATUS_LABELS[language as keyof typeof STATUS_LABELS] || STATUS_LABELS.english;
  const priorityLabels = PRIORITY_LEVELS[language as keyof typeof PRIORITY_LEVELS] || PRIORITY_LEVELS.english;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'verified':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600';
      case 'normal':
        return 'text-blue-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-600" />;
      case 'in_progress':
        return <Clock size={16} className="text-purple-600" />;
      default:
        return <AlertCircle size={16} className="text-blue-600" />;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon(complaint.status)}
          <span className="text-sm font-medium text-gray-600">
            ID: {complaint.id.slice(-8).toUpperCase()}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(complaint.status)}`}>
          {statusLabels[complaint.status as keyof typeof statusLabels]}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2">
          {complaint.category}
        </h3>
        
        {complaint.transcribedText && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {complaint.transcribedText}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock size={14} />
          <span>{formatDate(complaint.createdAt)}</span>
        </div>

        {complaint.location && (
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin size={14} />
            <span className="truncate">
              {complaint.location.address || 
               `${complaint.location.latitude}, ${complaint.location.longitude}`}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className={`flex items-center space-x-1 text-sm font-medium ${getPriorityColor(complaint.priority)}`}>
            {complaint.priority === 'urgent' && <AlertCircle size={14} />}
            <span>{priorityLabels[complaint.priority]}</span>
          </div>

          {complaint.mediaFiles.length > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <FileText size={14} />
              <span>{complaint.mediaFiles.length} file(s)</span>
            </div>
          )}
        </div>
      </div>

      {/* Verification Progress */}
      {complaint.verificationChain.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {complaint.verificationChain.map((step, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    step.status === 'approved' 
                      ? 'bg-green-500' 
                      : step.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              Verification: {complaint.verificationChain.filter(s => s.status === 'approved').length}/{complaint.verificationChain.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintCard;