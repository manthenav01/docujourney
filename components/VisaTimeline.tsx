"use client";

import React, { useRef } from 'react';
import { 
  Calendar, 
  FileCheck, 
  Stamp, 
  Plane, 
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Building2,
  CreditCard,
  FileText,
  Briefcase
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';

interface TimelineEvent {
  id: string;
  label: string;
  date: string | null;
  icon: React.ReactNode;
  status: 'completed' | 'current' | 'upcoming' | 'unknown';
  description?: string;
  eventType?: 'major' | 'minor';
  visaType?: string;
  employer?: string;
  documentType?: string;
  additionalInfo?: {
    receiptNumber?: string;
    visaNumber?: string;
    validFrom?: string;
    validTo?: string;
  };
}

interface VisaTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const VisaTimeline: React.FC<VisaTimelineProps> = ({ events, className = '' }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + 
        (direction === 'left' ? -scrollAmount : scrollAmount);
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white';
      case 'current':
        return 'bg-blue-500 border-blue-500 text-white animate-pulse';
      case 'upcoming':
        return 'bg-gray-200 border-gray-300 text-gray-600';
      case 'unknown':
      default:
        return 'bg-gray-100 border-gray-200 text-gray-400';
    }
  };

  const getLineColor = (currentStatus: string, nextStatus?: string) => {
    if (currentStatus === 'completed' && nextStatus === 'completed') {
      return 'bg-green-500';
    } else if (currentStatus === 'completed' || currentStatus === 'current') {
      return 'bg-gradient-to-r from-green-500 to-gray-300';
    } else {
      return 'bg-gray-300';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800 text-xs">Current</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-600 text-xs">Upcoming</Badge>;
      case 'unknown':
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  // Filter events with dates for display
  const validEvents = events.filter(event => event.date !== null);
  
  // Calculate progress
  const completedEvents = validEvents.filter(e => e.status === 'completed').length;
  const totalEvents = validEvents.length;
  const progressPercentage = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Visa Timeline</h3>
            <p className="text-sm text-gray-600 mb-3">
              {completedEvents} of {totalEvents} milestones completed ({progressPercentage}%)
            </p>
            {/* Progress Bar */}
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Mobile scroll controls */}
          <div className="flex gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('left')}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scroll('right')}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {validEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data Yet</h4>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Upload your visa-related documents to see your immigration timeline. 
              We'll automatically detect important dates and milestones.
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <FileCheck className="w-4 h-4" />
                <span>Petitions</span>
              </div>
              <div className="flex items-center gap-1">
                <Stamp className="w-4 h-4" />
                <span>Visas</span>
              </div>
              <div className="flex items-center gap-1">
                <Plane className="w-4 h-4" />
                <span>I-94 Records</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Timeline */}
            <div className="hidden md:block">
              <div className="py-8">
                {/* Timeline container using flexbox approach */}
                <div className="mx-8 relative">
                  {/* Timeline container - dots level */}
                  <div className="flex items-center justify-between relative mb-6">
                    {/* Base line that passes through the center of dots */}
                    <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
                      <div className="w-full h-0.5 bg-gray-200"></div>
                    </div>
                    
                    {validEvents.map((event, index) => (
                      <div key={event.id} className="relative group z-10">
                        {/* Event dot */}
                        <div className={`
                          ${event.eventType === 'minor' ? 'w-6 h-6' : 'w-8 h-8'}
                          rounded-full border-2 flex items-center justify-center bg-white shadow-sm
                          ${getStatusColor(event.status)}
                          transition-all duration-300 group-hover:scale-110
                        `}>
                          <div className={`${event.eventType === 'minor' ? 'w-3 h-3' : 'w-4 h-4'}`}>
                            {event.icon}
                          </div>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-56 shadow-xl">
                          <div className="font-medium mb-1">{event.label}</div>
                          <div className="text-gray-300 mb-1">{formatDate(event.date)}</div>
                          
                          {event.documentType && (
                            <div className="text-blue-300 mb-1">📄 {event.documentType}</div>
                          )}
                          {event.visaType && (
                            <div className="text-green-300 mb-1">🛂 {event.visaType}</div>
                          )}
                          {event.employer && (
                            <div className="text-yellow-300 mb-1">🏢 {event.employer}</div>
                          )}
                          {event.additionalInfo?.receiptNumber && (
                            <div className="text-gray-400 mb-1 text-xs">
                              Receipt: {event.additionalInfo.receiptNumber}
                            </div>
                          )}
                          {event.description && (
                            <div className="text-gray-400 text-xs">{event.description}</div>
                          )}
                          
                          {/* Tooltip arrow */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Colored Line Segments */}
                    {validEvents.map((event, index) => {
                      if (index === validEvents.length - 1) return null;
                      
                      const nextEvent = validEvents[index + 1];
                      const lineColor = getLineColor(event.status, nextEvent?.status);
                      const segmentWidth = 100 / (validEvents.length - 1);
                      const startPosition = (index / (validEvents.length - 1)) * 100;
                      
                      return (
                        <div
                          key={`line-${index}`}
                          className={`absolute top-1/2 transform -translate-y-1/2 h-0.5 z-0 ${lineColor}`}
                          style={{
                            left: `${startPosition}%`,
                            width: `${segmentWidth}%`
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Event details (below the timeline) */}
                  <div className="flex justify-between items-start">
                    {validEvents.map((event) => (
                      <div key={`details-${event.id}`} className="flex flex-col items-center max-w-[140px]">
                        {event.eventType !== 'minor' && (
                          <>
                            <p className="font-medium text-sm text-gray-900 mb-1 leading-tight text-center">
                              {event.label}
                            </p>
                            <p className="text-xs text-gray-600 mb-2 text-center">
                              {formatDate(event.date)}
                            </p>
                            <div className="flex justify-center">
                              {getStatusBadge(event.status)}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden">
              <div 
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
                {validEvents.map((event) => (
                  <div key={event.id} className="flex-shrink-0 snap-start">
                    <div className={`
                      flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200
                      ${event.eventType === 'minor' ? 'min-w-[260px]' : 'min-w-[300px]'}
                    `}>
                      {/* Event Circle */}
                      <div className={`
                        ${event.eventType === 'minor' ? 'w-8 h-8' : 'w-10 h-10'} 
                        rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white
                        ${getStatusColor(event.status)}
                      `}>
                        <div className={`${event.eventType === 'minor' ? 'w-4 h-4' : 'w-5 h-5'}`}>
                          {event.icon}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className={`font-medium text-gray-900 leading-tight ${event.eventType === 'minor' ? 'text-sm' : 'text-base'}`}>
                            {event.label}
                          </p>
                          {event.eventType !== 'minor' && (
                            <div className="ml-2 flex-shrink-0">
                              {getStatusBadge(event.status)}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          {formatDate(event.date)}
                        </p>
                        
                        {/* Additional Information */}
                        <div className="space-y-1">
                          {event.visaType && (
                            <p className="text-sm text-blue-600 flex items-center gap-1">
                              🛂 <span>{event.visaType}</span>
                            </p>
                          )}
                          {event.employer && (
                            <p className="text-sm text-orange-600 flex items-center gap-1">
                              🏢 <span className="truncate">{event.employer}</span>
                            </p>
                          )}
                          {event.additionalInfo?.receiptNumber && (
                            <p className="text-xs text-gray-500">
                              Receipt: <span className="font-mono">{event.additionalInfo.receiptNumber}</span>
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                <span className="text-xs text-gray-600">Upcoming</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to create timeline events from visa data
export const createVisaTimelineEvents = (
  documents: any[], 
  visaAnalysis?: any,
  profile?: any
): TimelineEvent[] => {
  const events: TimelineEvent[] = [];
  const currentDate = new Date();

  // Helper function to determine status based on date
  const getDateStatus = (date: string | null): 'completed' | 'current' | 'upcoming' | 'unknown' => {
    if (!date) return 'unknown';
    
    try {
      const eventDate = new Date(date);
      const timeDiff = eventDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      if (daysDiff < -30) return 'completed';
      if (daysDiff >= -30 && daysDiff <= 30) return 'current';
      if (daysDiff > 30) return 'upcoming';
      
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // Enhanced document type detection
  const getDocumentInfo = (doc: any) => {
    const docType = doc.extracted?.document_type?.toLowerCase() || doc.name?.toLowerCase() || '';
    const fileName = doc.name?.toLowerCase() || '';
    
    return {
      docType,
      fileName,
      isPetition: docType.includes('petition') || docType.includes('i-129') || docType.includes('i-140') || 
                 fileName.includes('petition') || fileName.includes('i-129') || fileName.includes('i-140'),
      isApproval: docType.includes('approval') || docType.includes('i-797') || docType.includes('notice') ||
                 fileName.includes('approval') || fileName.includes('i-797') || fileName.includes('notice'),
      isVisa: docType.includes('visa') || docType.includes('stamp') || docType.includes('passport') ||
             fileName.includes('visa') || fileName.includes('stamp'),
      isEntry: docType.includes('i-94') || docType.includes('entry') || docType.includes('arrival') ||
              fileName.includes('i-94') || fileName.includes('entry'),
      isGreenCard: docType.includes('green card') || docType.includes('permanent resident') || docType.includes('i-551') ||
                  fileName.includes('green') || fileName.includes('i-551'),
      isEAD: docType.includes('ead') || docType.includes('employment authorization') || docType.includes('i-765') ||
             fileName.includes('ead') || fileName.includes('work authorization'),
      isH1B: docType.includes('h-1b') || docType.includes('h1b') || fileName.includes('h-1b') || fileName.includes('h1b'),
      isL1: docType.includes('l-1') || docType.includes('l1') || fileName.includes('l-1') || fileName.includes('l1'),
      isO1: docType.includes('o-1') || docType.includes('o1') || fileName.includes('o-1') || fileName.includes('o1')
    };
  };

  // Helper function to get icon for document type
  const getDocumentIcon = (docInfo: any, doc: any) => {
    if (docInfo.isGreenCard) return <CreditCard className="w-full h-full" />;
    if (docInfo.isEAD) return <Briefcase className="w-full h-full" />;
    if (docInfo.isH1B || docInfo.isL1 || docInfo.isO1) return <Building2 className="w-full h-full" />;
    if (docInfo.isPetition) return <FileCheck className="w-full h-full" />;
    if (docInfo.isApproval) return <Calendar className="w-full h-full" />;
    if (docInfo.isVisa) return <Stamp className="w-full h-full" />;
    if (docInfo.isEntry) return <Plane className="w-full h-full" />;
    return <FileText className="w-full h-full" />;
  };

  // Helper function to extract visa type from document
  const getVisaTypeFromDocument = (doc: any) => {
    const docInfo = getDocumentInfo(doc);
    if (docInfo.isH1B) return 'H-1B';
    if (docInfo.isL1) return 'L-1';
    if (docInfo.isO1) return 'O-1';
    if (docInfo.isEAD) return 'EAD';
    if (docInfo.isGreenCard) return 'Green Card';
    return doc.extracted?.document_type || null;
  };

  // Add first entry date if available from profile
  if (profile?.firstEntryDate) {
    const visaTypeDescription = profile?.firstEntryVisaType ? 
      ` on ${profile.firstEntryVisaType} visa` : '';
    
    events.push({
      id: 'first-entry',
      label: 'First U.S. Entry',
      date: profile.firstEntryDate,
      icon: <Plane className="w-full h-full" />,
      status: getDateStatus(profile.firstEntryDate),
      eventType: 'major',
      description: `First entry to the United States${visaTypeDescription}`,
      visaType: profile.firstEntryVisaType
    });
  }

  // Add all intermediate visa documents with detailed information
  const allVisaDocuments = documents.filter(doc => {
    const docInfo = getDocumentInfo(doc);
    return docInfo.isPetition || docInfo.isApproval || docInfo.isVisa || 
           docInfo.isEAD || docInfo.isGreenCard || docInfo.isEntry;
  });

  // Sort documents by date
  const sortedDocs = allVisaDocuments.sort((a, b) => {
    const dateA = a.extracted?.issueDate || a.extracted?.validFrom || a.extracted?.notice_date || a.uploadedAt;
    const dateB = b.extracted?.issueDate || b.extracted?.validFrom || b.extracted?.notice_date || b.uploadedAt;
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  // Add each document as an event
  sortedDocs.forEach((doc, index) => {
    const docInfo = getDocumentInfo(doc);
    const eventDate = doc.extracted?.issueDate || doc.extracted?.validFrom || 
                     doc.extracted?.notice_date || doc.uploadedAt;
    
    // Determine if this is a major or minor event
    const isMajorEvent = docInfo.isPetition || docInfo.isApproval || 
                        docInfo.isGreenCard || docInfo.isEntry;

    // Create appropriate label
    let label = doc.extracted?.document_type || 'Document';
    if (docInfo.isPetition) label = 'Petition Filed';
    else if (docInfo.isApproval) label = 'Approval Notice';
    else if (docInfo.isVisa) label = 'Visa Stamp';
    else if (docInfo.isEAD) label = 'Work Authorization';
    else if (docInfo.isGreenCard) label = 'Green Card';
    else if (docInfo.isEntry) label = 'U.S. Entry';

    events.push({
      id: `doc-${doc.id}-${index}`,
      label,
      date: eventDate,
      icon: getDocumentIcon(docInfo, doc),
      status: getDateStatus(eventDate),
      eventType: isMajorEvent ? 'major' : 'minor',
      description: doc.extracted?.document_type || 'Visa-related document',
      documentType: doc.extracted?.document_type,
      visaType: getVisaTypeFromDocument(doc),
      employer: doc.extracted?.petitioner,
      additionalInfo: {
        receiptNumber: doc.extracted?.receipt_number,
        visaNumber: doc.extracted?.visa_number,
        validFrom: doc.extracted?.valid_from,
        validTo: doc.extracted?.valid_to
      }
    });
  });

  // Add status expiration event
  const approvalDocs = documents.filter(doc => getDocumentInfo(doc).isApproval);
  const petitionDocs = documents.filter(doc => getDocumentInfo(doc).isPetition);
  
  const endDate = approvalDocs.length > 0 ? 
    (approvalDocs[0].extracted?.valid_to || approvalDocs[0].extracted?.expirationDate) :
    (petitionDocs.length > 0 ? 
      (petitionDocs[0].extracted?.valid_to || petitionDocs[0].extracted?.expirationDate) : null);

  if (endDate) {
    events.push({
      id: 'status-expiration',
      label: 'Status Expires',
      date: endDate,
      icon: <CalendarX className="w-full h-full" />,
      status: getDateStatus(endDate),
      eventType: 'major',
      description: 'Current status validity expires'
    });
  }

  // Remove duplicate events and sort by date
  const uniqueEvents = events.filter((event, index, self) => 
    index === self.findIndex(e => e.id === event.id)
  );

  // Sort events by date
  const sortedEvents = uniqueEvents.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Filter out events without dates for better UX, but include major events even without dates
  const eventsWithDates = sortedEvents.filter(event => 
    event.date !== null || event.eventType === 'major'
  );

  return eventsWithDates;
};

export default VisaTimeline;
