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
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Immigration Journey</h3>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {completedEvents} of {totalEvents} milestones completed ({progressPercentage}%)
            </p>
            {/* Progress Bar */}
            <div className="w-48 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
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
              Upload your visa-related documents to see your immigration journey. 
              We'll automatically detect important dates and key milestones.
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
              <div className="py-6">
                {/* Timeline container using flexbox approach */}
                <div className="mx-4 relative">
                  {/* Timeline container - dots level */}
                  <div className="flex items-center justify-between relative mb-8">
                    {/* Base line that passes through the center of dots */}
                    <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2">
                      <div className="w-full h-0.5 bg-gray-200"></div>
                    </div>
                    
                    {validEvents.map((event, index) => (
                      <div key={event.id} className="relative group z-10">
                        {/* Event dot */}
                        <div className={`
                          ${event.eventType === 'minor' ? 'w-5 h-5' : 'w-7 h-7'}
                          rounded-full border-2 flex items-center justify-center bg-white shadow-sm
                          ${getStatusColor(event.status)}
                          transition-all duration-300 group-hover:scale-110
                        `}>
                          <div className={`${event.eventType === 'minor' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`}>
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
                className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-2 px-2"
                style={{ 
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none'
                }}
              >
                {validEvents.map((event) => (
                  <div key={event.id} className="flex-shrink-0 snap-start">
                    <div className={`
                      flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm
                      ${event.eventType === 'minor' ? 'min-w-[250px]' : 'min-w-[280px]'}
                      hover:shadow-md transition-all duration-200
                    `}>
                      {/* Event Circle */}
                      <div className={`
                        ${event.eventType === 'minor' ? 'w-7 h-7' : 'w-8 h-8'} 
                        rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white
                        ${getStatusColor(event.status)}
                      `}>
                        <div className={`${event.eventType === 'minor' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}>
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
            <div className="flex items-center justify-center gap-6 mt-8 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-sm text-gray-600">Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                <span className="text-sm text-gray-600">Upcoming</span>
              </div>
            </div>
          </>
        )}
    </div>
  );
};

// Intelligent helper function to create meaningful timeline events with key milestones
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
      
      if (daysDiff < -7) return 'completed';
      if (daysDiff >= -7 && daysDiff <= 30) return 'current';
      if (daysDiff > 30) return 'upcoming';
      
      return 'unknown';
    } catch {
      return 'unknown';
    }
  };

  // Enhanced document categorization for milestone-based timeline
  const categorizeDocuments = (docs: any[]) => {
    const categories = {
      f1Documents: [] as any[],
      h1bPetitions: [] as any[],
      h1bApprovals: [] as any[],
      h1bVisas: [] as any[],
      l1Petitions: [] as any[],
      l1Approvals: [] as any[],
      l1Visas: [] as any[],
      o1Petitions: [] as any[],
      o1Approvals: [] as any[],
      b1b2Documents: [] as any[],
      eadApplications: [] as any[],
      eadApprovals: [] as any[],
      eadCards: [] as any[],
      greenCardPetitions: [] as any[],
      greenCardApprovals: [] as any[],
      greenCards: [] as any[],
      i94Documents: [] as any[]
    };

    docs.forEach(doc => {
      const docType = doc.extracted?.document_type?.toLowerCase();
      const fileName = doc.name?.toLowerCase() || '';
      
      // F-1 Student Documents
      if ((docType.includes('f-1') || docType.includes('f1') || fileName.includes('f-1') || fileName.includes('f1') || 
           docType.includes('student') || docType.includes('i-20'))) {
        categories.f1Documents.push(doc);
      }
     
      // H-1B Documents
      else if ((docType.includes('h-1b') || docType.includes('h1b') || fileName.includes('h-1b') || fileName.includes('h1b'))) {
        if (docType.includes('petition') || docType.includes('i-129')) {
          categories.h1bPetitions.push(doc);
        } else if (docType.includes('approval') || docType.includes('i-797')) {
          categories.h1bApprovals.push(doc);
        } else if (docType.includes('visa') || docType.includes('stamp')) {
          categories.h1bVisas.push(doc);
        }
      }

       // B-1/B-2 Visitor Documents
      else if (!docType.includes('h-1b') && (docType.includes('b-1') || docType.includes('b-2') || docType.includes('b1') || docType.includes('b2') || 
               fileName.includes('b-1') || fileName.includes('b-2') || docType.includes('visitor'))) {
        categories.b1b2Documents.push(doc);
      }

      // L-1 Documents
      else if ((docType.includes('l-1') || docType.includes('l1') || fileName.includes('l-1') || fileName.includes('l1'))) {
        if (docType.includes('petition') || docType.includes('i-129')) {
          categories.l1Petitions.push(doc);
        } else if (docType.includes('approval') || docType.includes('i-797')) {
          categories.l1Approvals.push(doc);
        } else if (docType.includes('visa') || docType.includes('stamp')) {
          categories.l1Visas.push(doc);
        }
      }
      // O-1 Documents  
      else if ((docType.includes('o-1') || docType.includes('o1') || fileName.includes('o-1') || fileName.includes('o1'))) {
        if (docType.includes('petition') || docType.includes('i-129')) {
          categories.o1Petitions.push(doc);
        } else if (docType.includes('approval') || docType.includes('i-797')) {
          categories.o1Approvals.push(doc);
        }
      }
      // EAD Documents
      else if (docType.includes('ead') || docType.includes('employment authorization') || docType.includes('i-765')) {
        if (docType.includes('application') || docType.includes('i-765')) {
          categories.eadApplications.push(doc);
        } else if (docType.includes('approval') || docType.includes('i-797')) {
          categories.eadApprovals.push(doc);
        } else {
          categories.eadCards.push(doc);
        }
      }
      // Green Card Documents
      else if (docType.includes('green card') || docType.includes('permanent resident') || docType.includes('i-551') || docType.includes('i-140')) {
        if (docType.includes('petition') || docType.includes('i-140')) {
          categories.greenCardPetitions.push(doc);
        } else if (docType.includes('approval')) {
          categories.greenCardApprovals.push(doc);
        } else {
          categories.greenCards.push(doc);
        }
      }
      // I-94 Entry documents (for reference but not used in timeline since we get entry from profile)
      else if (docType.includes('i-94') || docType.includes('entry') || docType.includes('arrival')) {
        categories.i94Documents.push(doc);
      }
    });

    return categories;
  };

  const categories = categorizeDocuments(documents);

  // Add First Entry to US (only from profile - not from documents)
  if (profile?.firstEntryDate) {
    events.push({
      id: 'first-entry-us',
      label: 'First U.S. Entry',
      date: profile.firstEntryDate,
      icon: <Plane className="w-full h-full" />,
      status: getDateStatus(profile.firstEntryDate),
      eventType: 'major',
      description: `Initial entry to the United States${profile.firstEntryVisaType ? ` on ${profile.firstEntryVisaType} visa` : ''}`,
      visaType: profile.firstEntryVisaType
    });
  }

  // Add F-1 Student Journey Milestones
  if (categories.f1Documents.length > 0) {
    const firstF1 = categories.f1Documents[0];
    const f1Date = firstF1.extracted?.issueDate || firstF1.extracted?.validFrom || firstF1.uploadedAt;
    
    events.push({
      id: 'f1-status',
      label: 'F-1 Student Status',
      date: f1Date,
      icon: <Building2 className="w-full h-full" />,
      status: getDateStatus(f1Date),
      eventType: 'major',
      description: 'F-1 student visa status - authorized for full-time study',
      visaType: 'F-1'
    });
  }

  // Add B-1/B-2 Visitor Journey
  if (categories.b1b2Documents.length > 0) {
    const firstVisitor = categories.b1b2Documents[0];
    const visitorDate = firstVisitor.extracted?.issueDate || firstVisitor.extracted?.validFrom || firstVisitor.uploadedAt;
    
    events.push({
      id: 'b1b2-visitor',
      label: 'B-1/B-2 Visitor Status',
      date: visitorDate,
      icon: <Plane className="w-full h-full" />,
      status: getDateStatus(visitorDate),
      eventType: 'major',
      description: 'B-1/B-2 visitor status - authorized for business or tourism',
      visaType: 'B-1/B-2'
    });
  }

  // Add H-1B Journey Milestones
  if (categories.h1bPetitions.length > 0 || categories.h1bApprovals.length > 0) {
    // H-1B Petition Filed (first one only)
    if (categories.h1bPetitions.length > 0) {
      const firstPetition = categories.h1bPetitions[0];
      const petitionDate = firstPetition.extracted?.receipt_date || firstPetition.extracted?.notice_date || firstPetition.uploadedAt;
      
      events.push({
        id: 'h1b-petition-filed',
        label: 'H-1B Petition Filed',
        date: petitionDate,
        icon: <FileCheck className="w-full h-full" />,
        status: getDateStatus(petitionDate),
        eventType: 'major',
        description: 'H-1B specialty occupation petition submitted to USCIS',
        visaType: 'H-1B',
        employer: firstPetition.extracted?.petitioner,
        additionalInfo: {
          receiptNumber: firstPetition.extracted?.receipt_number
        }
      });
    }

    // H-1B Approvals (first and last if different)
    if (categories.h1bApprovals.length > 0) {
      const firstApproval = categories.h1bApprovals[0];
      const latestApproval = categories.h1bApprovals[categories.h1bApprovals.length - 1];
      
      // Add first approval event
      const firstApprovalDate = firstApproval.extracted?.notice_date || firstApproval.extracted?.issueDate || firstApproval.uploadedAt;
      events.push({
        id: 'h1b-first-approved',
        label: categories.h1bApprovals.length > 1 ? 'H-1B First Approved' : 'H-1B Approved',
        date: firstApprovalDate,
        icon: <Calendar className="w-full h-full" />,
        status: getDateStatus(firstApprovalDate),
        eventType: 'major',
        description: categories.h1bApprovals.length > 1 ? 'Initial H-1B petition approved by USCIS' : 'H-1B petition approved by USCIS',
        visaType: 'H-1B',
        employer: firstApproval.extracted?.petitioner,
        additionalInfo: {
          receiptNumber: firstApproval.extracted?.receipt_number,
          validFrom: firstApproval.extracted?.valid_from,
          validTo: firstApproval.extracted?.valid_to
        }
      });

      // Add latest approval event if different from first
      if (categories.h1bApprovals.length > 1) {
        const latestApprovalDate = latestApproval.extracted?.notice_date || latestApproval.extracted?.issueDate || latestApproval.uploadedAt;
        events.push({
          id: 'h1b-latest-approved',
          label: 'H-1B Latest Approved',
          date: latestApprovalDate,
          icon: <Calendar className="w-full h-full" />,
          status: getDateStatus(latestApprovalDate),
          eventType: 'major',
          description: 'Most recent H-1B petition approved by USCIS',
          visaType: 'H-1B',
          employer: latestApproval.extracted?.petitioner,
          additionalInfo: {
            receiptNumber: latestApproval.extracted?.receipt_number,
            validFrom: latestApproval.extracted?.valid_from,
            validTo: latestApproval.extracted?.valid_to
          }
        });
      }

      // H-1B Status Expiration (based on latest approval)
      const expirationDate = latestApproval.extracted?.valid_to;
      if (expirationDate) {
        events.push({
          id: 'h1b-expires',
          label: 'H-1B Status Expires',
          date: expirationDate,
          icon: <CalendarX className="w-full h-full" />,
          status: getDateStatus(expirationDate),
          eventType: 'major',
          description: 'Current H-1B authorization expires - extension or new petition required',
          visaType: 'H-1B'
        });
      }
    }

    // H-1B Visa Stamp (if available)
    if (categories.h1bVisas.length > 0) {
      const latestVisa = categories.h1bVisas[categories.h1bVisas.length - 1];
      const visaDate = latestVisa.extracted?.issueDate || latestVisa.uploadedAt;
      
      events.push({
        id: 'h1b-visa-issued',
        label: 'H-1B Visa Issued',
        date: visaDate,
        icon: <Stamp className="w-full h-full" />,
        status: getDateStatus(visaDate),
        eventType: 'major',
        description: 'H-1B visa stamp issued by U.S. Consulate',
        visaType: 'H-1B',
        additionalInfo: {
          visaNumber: latestVisa.extracted?.visa_number,
          validFrom: latestVisa.extracted?.valid_from,
          validTo: latestVisa.extracted?.valid_to
        }
      });
    }
  }

  // Add L-1 Journey Milestones
  if (categories.l1Petitions.length > 0 || categories.l1Approvals.length > 0) {
    if (categories.l1Petitions.length > 0) {
      const firstPetition = categories.l1Petitions[0];
      const petitionDate = firstPetition.extracted?.receipt_date || firstPetition.extracted?.notice_date || firstPetition.uploadedAt;
      
      events.push({
        id: 'l1-petition-filed',
        label: 'L-1 Petition Filed',
        date: petitionDate,
        icon: <Building2 className="w-full h-full" />,
        status: getDateStatus(petitionDate),
        eventType: 'major',
        description: 'L-1 intracompany transfer petition submitted',
        visaType: 'L-1',
        employer: firstPetition.extracted?.petitioner
      });
    }

    // L-1 Approvals (first and last if different)
    if (categories.l1Approvals.length > 0) {
      const firstApproval = categories.l1Approvals[0];
      const latestApproval = categories.l1Approvals[categories.l1Approvals.length - 1];
      
      // Add first approval event
      const firstApprovalDate = firstApproval.extracted?.notice_date || firstApproval.extracted?.issueDate || firstApproval.uploadedAt;
      events.push({
        id: 'l1-first-approved',
        label: categories.l1Approvals.length > 1 ? 'L-1 First Approved' : 'L-1 Approved',
        date: firstApprovalDate,
        icon: <Calendar className="w-full h-full" />,
        status: getDateStatus(firstApprovalDate),
        eventType: 'major',
        description: categories.l1Approvals.length > 1 ? 'Initial L-1 petition approved by USCIS' : 'L-1 petition approved by USCIS',
        visaType: 'L-1',
        employer: firstApproval.extracted?.petitioner
      });

      // Add latest approval event if different from first
      if (categories.l1Approvals.length > 1) {
        const latestApprovalDate = latestApproval.extracted?.notice_date || latestApproval.extracted?.issueDate || latestApproval.uploadedAt;
        events.push({
          id: 'l1-latest-approved',
          label: 'L-1 Latest Approved',
          date: latestApprovalDate,
          icon: <Calendar className="w-full h-full" />,
          status: getDateStatus(latestApprovalDate),
          eventType: 'major',
          description: 'Most recent L-1 petition approved by USCIS',
          visaType: 'L-1',
          employer: latestApproval.extracted?.petitioner
        });
      }
    }
  }

  // Add O-1 Journey Milestones  
  if (categories.o1Petitions.length > 0 || categories.o1Approvals.length > 0) {
    if (categories.o1Petitions.length > 0) {
      const firstPetition = categories.o1Petitions[0];
      const petitionDate = firstPetition.extracted?.receipt_date || firstPetition.extracted?.notice_date || firstPetition.uploadedAt;
      
      events.push({
        id: 'o1-petition-filed',
        label: 'O-1 Petition Filed',
        date: petitionDate,
        icon: <Building2 className="w-full h-full" />,
        status: getDateStatus(petitionDate),
        eventType: 'major',
        description: 'O-1 extraordinary ability petition submitted',
        visaType: 'O-1',
        employer: firstPetition.extracted?.petitioner
      });
    }

    // O-1 Approvals (first and last if different)
    if (categories.o1Approvals.length > 0) {
      const firstApproval = categories.o1Approvals[0];
      const latestApproval = categories.o1Approvals[categories.o1Approvals.length - 1];
      
      // Add first approval event
      const firstApprovalDate = firstApproval.extracted?.notice_date || firstApproval.extracted?.issueDate || firstApproval.uploadedAt;
      events.push({
        id: 'o1-first-approved',
        label: categories.o1Approvals.length > 1 ? 'O-1 First Approved' : 'O-1 Approved',
        date: firstApprovalDate,
        icon: <Calendar className="w-full h-full" />,
        status: getDateStatus(firstApprovalDate),
        eventType: 'major',
        description: categories.o1Approvals.length > 1 ? 'Initial O-1 petition approved by USCIS' : 'O-1 petition approved by USCIS',
        visaType: 'O-1',
        employer: firstApproval.extracted?.petitioner
      });

      // Add latest approval event if different from first
      if (categories.o1Approvals.length > 1) {
        const latestApprovalDate = latestApproval.extracted?.notice_date || latestApproval.extracted?.issueDate || latestApproval.uploadedAt;
        events.push({
          id: 'o1-latest-approved',
          label: 'O-1 Latest Approved',
          date: latestApprovalDate,
          icon: <Calendar className="w-full h-full" />,
          status: getDateStatus(latestApprovalDate),
          eventType: 'major',
          description: 'Most recent O-1 petition approved by USCIS',
          visaType: 'O-1',
          employer: latestApproval.extracted?.petitioner
        });
      }
    }
  }

  // Add EAD Journey Milestones
  if (categories.eadApplications.length > 0 || categories.eadApprovals.length > 0 || categories.eadCards.length > 0) {
    if (categories.eadApplications.length > 0) {
      const latestApp = categories.eadApplications[categories.eadApplications.length - 1];
      const appDate = latestApp.extracted?.receipt_date || latestApp.uploadedAt;
      
      events.push({
        id: 'ead-applied',
        label: 'Work Authorization Applied',
        date: appDate,
        icon: <Briefcase className="w-full h-full" />,
        status: getDateStatus(appDate),
        eventType: 'major',
        description: 'Employment Authorization Document (EAD) application filed',
        visaType: 'EAD'
      });
    }

    // EAD Approvals (first and last if different)
    if (categories.eadApprovals.length > 0) {
      const firstApproval = categories.eadApprovals[0];
      const latestApproval = categories.eadApprovals[categories.eadApprovals.length - 1];
      
      // Add first approval event
      const firstApprovalDate = firstApproval.extracted?.notice_date || firstApproval.extracted?.issueDate || firstApproval.uploadedAt;
      events.push({
        id: 'ead-first-approved',
        label: categories.eadApprovals.length > 1 ? 'EAD First Approved' : 'EAD Approved',
        date: firstApprovalDate,
        icon: <Calendar className="w-full h-full" />,
        status: getDateStatus(firstApprovalDate),
        eventType: 'major',
        description: categories.eadApprovals.length > 1 ? 'Initial EAD application approved by USCIS' : 'EAD application approved by USCIS',
        visaType: 'EAD'
      });

      // Add latest approval event if different from first
      if (categories.eadApprovals.length > 1) {
        const latestApprovalDate = latestApproval.extracted?.notice_date || latestApproval.extracted?.issueDate || latestApproval.uploadedAt;
        events.push({
          id: 'ead-latest-approved',
          label: 'EAD Latest Approved',
          date: latestApprovalDate,
          icon: <Calendar className="w-full h-full" />,
          status: getDateStatus(latestApprovalDate),
          eventType: 'major',
          description: 'Most recent EAD application approved by USCIS',
          visaType: 'EAD'
        });
      }
    }

    if (categories.eadCards.length > 0) {
      const latestCard = categories.eadCards[categories.eadCards.length - 1];
      const cardDate = latestCard.extracted?.issueDate || latestCard.uploadedAt;
      
      events.push({
        id: 'ead-received',
        label: 'Work Authorization Granted',
        date: cardDate,
        icon: <CreditCard className="w-full h-full" />,
        status: getDateStatus(cardDate),
        eventType: 'major',
        description: 'Employment Authorization Document received',
        visaType: 'EAD',
        additionalInfo: {
          validFrom: latestCard.extracted?.valid_from,
          validTo: latestCard.extracted?.valid_to
        }
      });
    }
  }

  // Add Green Card Journey Milestones
  if (categories.greenCardPetitions.length > 0 || categories.greenCards.length > 0) {
    if (categories.greenCardPetitions.length > 0) {
      const firstPetition = categories.greenCardPetitions[0];
      const petitionDate = firstPetition.extracted?.receipt_date || firstPetition.uploadedAt;
      
      events.push({
        id: 'gc-petition-filed',
        label: 'Green Card Process Started',
        date: petitionDate,
        icon: <FileText className="w-full h-full" />,
        status: getDateStatus(petitionDate),
        eventType: 'major',
        description: 'Permanent residence petition filed (I-140)',
        visaType: 'Green Card',
        employer: firstPetition.extracted?.petitioner
      });
    }

    // Green Card Approvals (first and last if different)
    if (categories.greenCardApprovals.length > 0) {
      const firstApproval = categories.greenCardApprovals[0];
      const latestApproval = categories.greenCardApprovals[categories.greenCardApprovals.length - 1];
      
      // Add first approval event
      const firstApprovalDate = firstApproval.extracted?.notice_date || firstApproval.extracted?.issueDate || firstApproval.uploadedAt;
      events.push({
        id: 'gc-first-approved',
        label: categories.greenCardApprovals.length > 1 ? 'Green Card First Approved' : 'Green Card Approved',
        date: firstApprovalDate,
        icon: <Calendar className="w-full h-full" />,
        status: getDateStatus(firstApprovalDate),
        eventType: 'major',
        description: categories.greenCardApprovals.length > 1 ? 'Initial I-140 petition approved by USCIS' : 'I-140 petition approved by USCIS',
        visaType: 'Green Card',
        employer: firstApproval.extracted?.petitioner
      });

      // Add latest approval event if different from first
      if (categories.greenCardApprovals.length > 1) {
        const latestApprovalDate = latestApproval.extracted?.notice_date || latestApproval.extracted?.issueDate || latestApproval.uploadedAt;
        events.push({
          id: 'gc-latest-approved',
          label: 'Green Card Latest Approved',
          date: latestApprovalDate,
          icon: <Calendar className="w-full h-full" />,
          status: getDateStatus(latestApprovalDate),
          eventType: 'major',
          description: 'Most recent I-140 petition approved by USCIS',
          visaType: 'Green Card',
          employer: latestApproval.extracted?.petitioner
        });
      }
    }

    if (categories.greenCards.length > 0) {
      const card = categories.greenCards[0];
      const cardDate = card.extracted?.issueDate || card.uploadedAt;
      
      events.push({
        id: 'gc-received',
        label: 'Permanent Resident',
        date: cardDate,
        icon: <CreditCard className="w-full h-full" />,
        status: getDateStatus(cardDate),
        eventType: 'major',
        description: 'Green Card received - Permanent Resident status granted',
        visaType: 'Green Card'
      });
    }
  }

  // Sort events by date
  const sortedEvents = events.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Add intelligent next steps prediction
  const addNextSteps = (events: TimelineEvent[]) => {
    const hasF1 = events.some(e => e.visaType === 'F-1');
    const hasH1B = events.some(e => e.visaType === 'H-1B');
    const hasL1 = events.some(e => e.visaType === 'L-1');
    const hasEAD = events.some(e => e.visaType === 'EAD');
    const hasGreenCard = events.some(e => e.visaType === 'Green Card');
    const hasVisitor = events.some(e => e.visaType === 'B-1/B-2');

    // F-1 to H-1B transition
    if (hasF1 && !hasH1B && !hasGreenCard) {
      const h1bSuggestionDate = new Date(currentDate.getTime() + (120 * 24 * 60 * 60 * 1000)); // 4 months from now
      events.push({
        id: 'suggested-h1b-transition',
        label: 'Consider H-1B Application',
        date: h1bSuggestionDate.toISOString(),
        icon: <FileCheck className="w-full h-full" />,
        status: 'upcoming',
        eventType: 'major',
        description: 'Transition from F-1 student to H-1B work authorization',
        visaType: 'H-1B'
      });
    }

    // H-1B extension or Green Card path
    if (hasH1B && !hasGreenCard) {
      // Check if H-1B is expiring soon
      const h1bExpiry = events.find(e => e.id === 'h1b-expires');
      if (h1bExpiry && h1bExpiry.status === 'current') {
        const extensionDate = new Date(currentDate.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days from now
        events.push({
          id: 'suggested-h1b-extension',
          label: 'H-1B Extension Due',
          date: extensionDate.toISOString(),
          icon: <FileCheck className="w-full h-full" />,
          status: 'upcoming',
          eventType: 'major',
          description: 'Consider filing H-1B extension or start Green Card process',
          visaType: 'H-1B'
        });
      }
      
      // Always suggest Green Card if on H-1B and no Green Card in progress
      const gcSuggestionDate = new Date(currentDate.getTime() + (180 * 24 * 60 * 60 * 1000)); // 6 months from now
      events.push({
        id: 'suggested-green-card',
        label: 'Consider Green Card',
        date: gcSuggestionDate.toISOString(),
        icon: <CreditCard className="w-full h-full" />,
        status: 'upcoming',
        eventType: 'major',
        description: 'Start permanent residence process for long-term stability',
        visaType: 'Green Card'
      });
    }

    // EAD renewal suggestion
    if (hasEAD && !hasGreenCard) {
      const eadRenewalDate = new Date(currentDate.getTime() + (150 * 24 * 60 * 60 * 1000)); // 5 months from now
      events.push({
        id: 'suggested-ead-renewal',
        label: 'EAD Renewal Reminder',
        date: eadRenewalDate.toISOString(),
        icon: <Briefcase className="w-full h-full" />,
        status: 'upcoming',
        eventType: 'major',
        description: 'Remember to renew Employment Authorization Document',
        visaType: 'EAD'
      });
    }

    // Visitor to more permanent status
    if (hasVisitor && !hasF1 && !hasH1B && !hasL1 && !hasGreenCard) {
      const statusChangeDate = new Date(currentDate.getTime() + (60 * 24 * 60 * 60 * 1000)); // 2 months from now
      events.push({
        id: 'suggested-status-change',
        label: 'Consider Status Change',
        date: statusChangeDate.toISOString(),
        icon: <Building2 className="w-full h-full" />,
        status: 'upcoming',
        eventType: 'major',
        description: 'Explore options for more permanent immigration status',
        visaType: 'Status Change'
      });
    }

    return events;
  };

  return addNextSteps(sortedEvents.filter(event => event.date !== null));
};

export default VisaTimeline;
