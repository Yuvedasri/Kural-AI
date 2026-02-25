import { CheckCircle, FileText, Activity, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ComplaintSuccessProps {
    language: string;
    complaintData: any;
    onViewComplaints: () => void;
}

const ComplaintSuccess: React.FC<ComplaintSuccessProps> = ({
    complaintData,
    onViewComplaints
}) => {
    const { t } = useTranslation();

    if (!complaintData) {
        return (
            <div className="text-center py-12">
                <p>No complaint data available.</p>
                <button
                    onClick={onViewComplaints}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
                >
                    {t('viewMyComplaints')}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto border border-gray-100 text-center mt-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle size={40} className="text-green-600" />
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-3">{t('successTitle')}</h2>
            <p className="text-gray-600 mb-8 text-lg">{t('successSubtitle')}</p>

            <div className="bg-blue-50/50 rounded-2xl p-6 text-left mb-8 border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-4 flex items-center border-b border-blue-100 pb-3">
                    <FileText size={20} className="mr-2 text-blue-600" />
                    {t('complaintSummary')}
                </h3>

                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1 sm:mb-0">{t('ticketId')}</div>
                        <div className="font-mono font-bold text-gray-800 tracking-wider">
                            {complaintData._id?.slice(-8).toUpperCase() || 'UNKNOWN'}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1 sm:mb-0">{t('detectedCategory')}</div>
                        <div className="font-semibold text-gray-800 flex items-center">
                            <Activity size={16} className="mr-2 text-blue-500" />
                            {complaintData.category}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1 sm:mb-0">{t('priorityValidation')}</div>
                        <div className={`font-bold flex items-center ${complaintData.priorityLabel === 'High' ? 'text-red-600' :
                            complaintData.priorityLabel === 'Medium' ? 'text-orange-500' : 'text-green-600'
                            }`}>
                            <AlertCircle size={16} className="mr-2" />
                            {complaintData.priorityLabel}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                        <div className="text-sm text-gray-500 mb-1 sm:mb-0">{t('status')}</div>
                        <div className="font-semibold text-blue-600">
                            {t('submitted') || 'Submitted'}
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={onViewComplaints}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                {t('viewMyComplaints')}
            </button>
        </div>
    );
};

export default ComplaintSuccess;
