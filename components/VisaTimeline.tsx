"use client";

import React, { useRef } from 'react';
import { 
  Calendar, 
  FileCheck, 
  Stamp, 
  Plane, 
  Clock, 
  CalendarX,
  ChevronLeft,
  ChevronRight
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

  const getLineColor = (index: number, events: TimelineEvent[]) => {
    const currentEvent = events[index];
    const nextEvent = events[index + 1];
    
    if (currentEvent.status === 'completed' && nextEvent?.status === 'completed') {
      return 'bg-green-500';
    } else if (currentEvent.status === 'completed' || currentEvent.status === 'current') {
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

  return (
    <Card className={`relative ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Visa Timeline</h3>
            <p className="text-sm text-gray-600 mt-1">
              {(() => {
                const completedEvents = events.filter(e => e.status === 'completed').length;
                const totalEvents = events.filter(e => e.date !== null).length;
                const progressPercentage = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
                return `${completedEvents} of ${totalEvents} milestones completed (${progressPercentage}%)`;
              })()}
            </p>
            {/* Progress Bar */}
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${(() => {
                    const completedEvents = events.filter(e => e.status === 'completed').length;
                    const totalEvents = events.filter(e => e.date !== null).length;
                    return totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;
                  })()}%` 
                }}
              />
            </div>
          </div>
          <div className="flex gap-2">
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
        {events.filter(e => e.date !== null).length === 0 ? (
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
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full">
              {events.map((_, index) => {
                if (index === events.length - 1) return null;
                const lineColor = getLineColor(index, events);
                const leftPosition = (index / (events.length - 1)) * 100;
                const width = (1 / (events.length - 1)) * 100;
                
                return (
                  <div
                    key={`line-${index}`}
                    className={`absolute top-0 h-full rounded-full ${lineColor}`}
                    style={{
                      left: `${leftPosition}%`,
                      width: `${width}%`
                    }}
                  />
                );
              })}
            </div>

            {/* Timeline Events */}
            <div className="flex justify-between items-start">
              {events.map((event, index) => (
                <div key={event.id} className="flex flex-col items-center relative group">
                  {/* Event Circle */}
                  <div className={`
                    w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 mb-4 relative
                    ${getStatusColor(event.status)}
                    transition-all duration-300 group-hover:scale-110
                  `}>
                    <div className="w-4 h-4">
                      {event.icon}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                      <div className="font-medium">{event.label}</div>
                      <div className="text-gray-300">{formatDate(event.date)}</div>
                      {event.description && (
                        <div className="text-gray-400 mt-1">{event.description}</div>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="text-center max-w-32">
                    <p className="font-medium text-sm text-gray-900 mb-1">
                      {event.label}
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      {formatDate(event.date)}
                    </p>
                    {getStatusBadge(event.status)}
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1 hidden group-hover:block">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Timeline */}
        <div className="md:hidden">
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {events.map((event, index) => (
              <div key={event.id} className="flex-shrink-0 snap-start">
                <div className="flex items-center gap-3 min-w-[280px] p-4 bg-gray-50 rounded-lg">
                  {/* Event Circle */}
                  <div className={`
                    w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${getStatusColor(event.status)}
                  `}>
                    <div className="w-5 h-5">
                      {event.icon}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm text-gray-900">
                        {event.label}
                      </p>
                      {getStatusBadge(event.status)}
                    </div>
                    <p className="text-xs text-gray-600 mb-1">
                      {formatDate(event.date)}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500">
                        {event.description}
                      </p>
                    )}
                  </div>

                  {/* Connection Line */}
                  {index < events.length - 1 && (
                    <div className="absolute right-0 top-1/2 w-6 h-0.5 bg-gray-300 transform translate-x-full -translate-y-1/2 hidden" />
                  )}
                </div>
              </div>
            ))}
          </div>            </div>

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
                  fileName.includes('green') || fileName.includes('i-551')
    };
  };

  // Add first entry date if available from profile
  if (profile?.firstEntryDate) {
    events.push({
      id: 'first-entry',
      label: 'First U.S. Entry',
      date: profile.firstEntryDate,
      icon: <Plane className="w-full h-full" />,
      status: getDateStatus(profile.firstEntryDate),
      description: 'First entry to the United States'
    });
  }

  // Extract petition filed date
  const petitionDocs = documents.filter(doc => getDocumentInfo(doc).isPetition);
  const petitionDate = petitionDocs.length > 0 ? 
    petitionDocs[0].extracted?.issueDate || petitionDocs[0].extracted?.validFrom || petitionDocs[0].uploadedAt : null;

  events.push({
    id: 'petition-filed',
    label: 'Petition Filed',
    date: petitionDate,
    icon: <FileCheck className="w-full h-full" />,
    status: getDateStatus(petitionDate),
    description: petitionDocs.length > 0 ? 
      `${petitionDocs[0].extracted?.document_type || 'Petition'} submitted to USCIS` : 
      'Initial petition submitted to USCIS'
  });

  // Extract approval date
  const approvalDocs = documents.filter(doc => getDocumentInfo(doc).isApproval);
  const approvalDate = approvalDocs.length > 0 ? 
    approvalDocs[0].extracted?.issueDate || approvalDocs[0].extracted?.validFrom || approvalDocs[0].uploadedAt : null;

  events.push({
    id: 'approval-notice',
    label: 'Approval Notice',
    date: approvalDate,
    icon: <Calendar className="w-full h-full" />,
    status: getDateStatus(approvalDate),
    description: approvalDocs.length > 0 ? 
      `${approvalDocs[0].extracted?.document_type || 'Approval notice'} received` : 
      'USCIS approval received'
  });

  // Extract visa stamp date
  const visaDocs = documents.filter(doc => getDocumentInfo(doc).isVisa);
  const visaStampDate = visaDocs.length > 0 ? 
    visaDocs[0].extracted?.issueDate || visaDocs[0].extracted?.validFrom || visaDocs[0].uploadedAt : null;

  events.push({
    id: 'visa-stamp',
    label: 'Visa Stamp',
    date: visaStampDate,
    icon: <Stamp className="w-full h-full" />,
    status: getDateStatus(visaStampDate),
    description: visaDocs.length > 0 ? 
      'Visa stamped in passport' : 
      'Visa stamped in passport'
  });

  // Extract travel/entry date
  const entryDocs = documents.filter(doc => getDocumentInfo(doc).isEntry);
  const travelDate = entryDocs.length > 0 ? 
    entryDocs[0].extracted?.validFrom || entryDocs[0].extracted?.issueDate || entryDocs[0].uploadedAt : null;

  events.push({
    id: 'travel-date',
    label: 'Travel to U.S.',
    date: travelDate,
    icon: <Plane className="w-full h-full" />,
    status: getDateStatus(travelDate),
    description: 'Entered the United States'
  });

  // Extract I-94 admit until date
  const i94AdmitDate = entryDocs.length > 0 ? 
    entryDocs[0].extracted?.validTo || entryDocs[0].extracted?.expirationDate : null;

  events.push({
    id: 'i94-admit-until',
    label: 'I-94 Admit Until',
    date: i94AdmitDate,
    icon: <Clock className="w-full h-full" />,
    status: getDateStatus(i94AdmitDate),
    description: 'Authorized stay until this date'
  });

  // Extract petition/visa end date
  const endDate = approvalDocs.length > 0 ? 
    (approvalDocs[0].extracted?.validTo || approvalDocs[0].extracted?.expirationDate) :
    (petitionDocs.length > 0 ? 
      (petitionDocs[0].extracted?.validTo || petitionDocs[0].extracted?.expirationDate) : null);

  events.push({
    id: 'petition-end',
    label: 'Status Expires',
    date: endDate,
    icon: <CalendarX className="w-full h-full" />,
    status: getDateStatus(endDate),
    description: 'Current status validity expires'
  });

  // Filter out events without dates for better UX, but keep some structure
  const eventsWithDates = events.filter(event => event.date !== null);
  const eventsWithoutDates = events.filter(event => event.date === null);

  // If we have few events with dates, include some without dates to show structure
  if (eventsWithDates.length < 3) {
    return events; // Show all events including unknowns
  }

  return eventsWithDates; // Only show events with actual dates
};

export default VisaTimeline;
