import React from 'react';
import { useVisaStatus } from '@/hooks/useVisaStatus';
import { AlertTriangle, CheckCircle, Clock, RefreshCw, FileText } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@docujourney/ui';

interface VisaStatusCardProps {
  userId: string;
  profileId: string;
  profileName?: string;
  autoAnalyze?: boolean;
}

const VisaStatusCard: React.FC<VisaStatusCardProps> = ({
  userId,
  profileId,
  profileName,
  autoAnalyze = false,
}) => {
  const { visaStatus, isLoading, error, lastAnalyzed, analyzeStatus } = useVisaStatus({
    userId,
    profileId,
    autoAnalyze,
  });

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('expired') || lowerStatus.includes('out of status')) {
      return 'destructive';
    }
    if (lowerStatus.includes('pending') || lowerStatus.includes('expiring')) {
      return 'outline';
    }
    if (lowerStatus.includes('green card') || lowerStatus.includes('citizen')) {
      return 'default';
    }
    return 'secondary';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) {return 'text-green-600';}
    if (confidence >= 0.6) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Visa Status Analysis Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 text-sm mb-3">{error}</p>
          <Button
            onClick={analyzeStatus}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Visa Status Analysis
            {profileName && <span className="text-sm font-normal text-blue-600">- {profileName}</span>}
          </CardTitle>
          <Button
            onClick={analyzeStatus}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!visaStatus && !isLoading && (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="mb-2">No visa status analysis available</p>
            <p className="text-sm">Click &quot;Analyze&quot; to generate a status report</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-blue-700">Analyzing immigration documents...</p>
          </div>
        )}

        {visaStatus && (
          <>
            {/* Current Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Current Status</h3>
                <Badge variant={getStatusColor(visaStatus.currentStatus)}>
                  {visaStatus.currentStatus}
                </Badge>
              </div>
              
              {/* Visa Type */}
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-700">Visa Type</h4>
                <Badge variant="outline">
                  {visaStatus.visaType}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                {visaStatus.statusDetails}
              </p>
            </div>

            {/* Confidence Score */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Analysis Confidence</span>
              <span className={`text-sm font-semibold ${getConfidenceColor(visaStatus.confidence)}`}>
                {Math.round(visaStatus.confidence * 100)}%
              </span>
            </div>

            {/* Expiration Warnings */}
            {visaStatus.expirationWarnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Expiration Warnings
                </h4>
                <ul className="space-y-1">
                  {visaStatus.expirationWarnings.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded border-l-3 border-orange-300">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Actions */}
            {visaStatus.nextActions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Recommended Actions
                </h4>
                <ul className="space-y-1">
                  {visaStatus.nextActions.map((action, index) => (
                    <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded border-l-3 border-green-300">
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Last Updated */}
            {lastAnalyzed && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                <Clock className="w-3 h-3" />
                Last analyzed: {lastAnalyzed.toLocaleString()}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default VisaStatusCard;
