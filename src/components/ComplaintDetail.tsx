import React from 'react';
import { ArrowLeft, MapPin, Clock, User, MessageSquare, FileText, Play } from 'lucide-react';
import { Complaint } from '../types';
import { STATUS_LABELS, PRIORITY_LEVELS } from '../utils/constants';

interface ComplaintDetailProps {
  complaint: Complaint;
  language: string;
  onBack: () => void;
}

const ComplaintDetail: React.FC<ComplaintDetailProps> = ({
  complaint,
  language,
  onBack
}) => {
  const statusLabels = STATUS_LABELS[language as keyof typeof STATUS_LABELS] || STATUS_LABELS.english;
  const priorityLabels = PRIORITY_LEVELS[language as keyof typeof PRIORITY_LEVELS] || PRIORITY_LEVELS.english;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'verified':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Complaint Details
            </h1>
            <p className="text-gray-600">
              ID: {complaint.id.slice(-12).toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Status</div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(complaint.status)}`}>
              {statusLabels[complaint.status as keyof typeof statusLabels]}
            </span>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Priority</div>
            <div className="font-medium text-gray-800">
              {priorityLabels[complaint.priority]}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-500">Category</div>
            <div className="font-medium text-gray-800">
              {complaint.category}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Voice Recording */}
          {complaint.voiceRecording && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <Play size={20} />
                <span>Voice Recording</span>
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <audio controls className="w-full">
                  <source src={complaint.voiceRecording} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
                <div className="mt-3 text-sm text-blue-700">
                  <strong>Original Voice Complaint:</strong> Listen to the user's voice recording above
                </div>
              </div>
            </div>
          )}

          {/* Transcribed Text */}
          {complaint.transcribedText && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <FileText size={20} />
                <span>Transcribed Text</span>
              </h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-700 font-medium mb-2">
                  Auto-transcribed from voice:
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {complaint.transcribedText}
                </p>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Category: <span className="font-medium">{complaint.category}</span> | 
                Priority: <span className="font-medium">{complaint.priority}</span>
              </div>
            </div>
          )}

          {/* Media Files */}
          {complaint.mediaFiles.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Attachments
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {complaint.mediaFiles.map((file, index) => (
                  <img
                    key={index}
                    src={file}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
              <Clock size={20} />
              <span>Timeline</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-gray-800">Complaint Submitted</div>
                  <div className="text-sm text-gray-600">
                    {formatDate(complaint.createdAt)}
                  </div>
                </div>
              </div>
              
              {complaint.verificationChain.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    step.status === 'approved' 
                      ? 'bg-green-500' 
                      : step.status === 'rejected'
                      ? 'bg-red-500'
                      : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {step.status === 'approved' ? 'Approved by' : 
                       step.status === 'rejected' ? 'Rejected by' : 'Under review by'} {step.verifierName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {step.verifierRole} • {formatDate(step.timestamp)}
                    </div>
                    {step.notes && (
                      <div className="text-sm text-gray-600 mt-1 italic">
                        "{step.notes}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location */}
          {complaint.location && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <MapPin size={20} />
                <span>Location</span>
              </h3>
              <div className="space-y-2">
                <div className="text-gray-700">
                  {complaint.location.address || 'Location coordinates'}
                </div>
                <div className="text-sm text-gray-600">
                  {complaint.location.latitude.toFixed(6)}, {complaint.location.longitude.toFixed(6)}
                </div>
                <button className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  View on Map
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;