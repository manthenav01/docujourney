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
  Briefcase,
  RefreshCw,
  Sparkles,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { useTimeline } from '@/hooks/useTimeline';
import { TimelineEvent } from '@/lib/types/timeline.model';

interface VisaTimelineProps {
  userId: string;
  profileId?: string;
  className?: string;
}

const VisaTimeline: React.FC<VisaTimelineProps> = ({ 
  userId, 
  profileId, 
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Use the new timeline hook
  const { 
    timeline, 
    stats, 
    isLoading, 
    isGenerating, 
    error, 
    generateTimeline,
    clearError 
  } = useTimeline({ 
    userId, 
    profileId, 
    autoGenerate: true 
  });

  // Use timeline events from the hook
  const events = timeline;

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

  const formatDate = (dateString: string) => {
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

  const getEventIcon = (eventType?: string, visaType?: string) => {
    switch (eventType) {
      case 'deadline':
        return <CalendarX className="w-full h-full" />;
      case 'milestone':
        return <CheckCircle className="w-full h-full" />;
      case 'requirement':
        return <FileText className="w-full h-full" />;
      case 'suggestion':
        return <Sparkles className="w-full h-full" />;
      default:
        // Default icons based on visa type
        if (visaType?.includes('H-1B')) return <Building2 className="w-full h-full" />;
        if (visaType?.includes('F-1')) return <FileCheck className="w-full h-full" />;
        if (visaType?.includes('Green Card')) return <CreditCard className="w-full h-full" />;
        if (visaType?.includes('B-1') || visaType?.includes('B-2')) return <Plane className="w-full h-full" />;
        if (visaType?.includes('L-1')) return <Building2 className="w-full h-full" />;
        if (visaType?.includes('O-1')) return <Building2 className="w-full h-full" />;
        if (visaType?.includes('EAD')) return <Briefcase className="w-full h-full" />;
        return <Calendar className="w-full h-full" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-300 bg-red-50';
      case 'medium':
        return 'border-yellow-300 bg-yellow-50';
      case 'low':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  // Filter out events with invalid dates and sort by date
  const validEvents = timeline
    .filter(event => {
      try {
        new Date(event.date);
        return true;
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate progress using stats from hook or legacy calculation
  const completedEvents = stats.completed || validEvents.filter(e => e.status === 'completed').length;
  const totalEvents = stats.total || validEvents.length;
  const progressPercentage = stats.progressPercentage || (totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0);

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Immigration Timeline</h3>
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
          
        {/* Timeline Controls */}
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Timeline error</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="h-6 px-2 text-xs"
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateTimeline(true)}
            disabled={isGenerating}
            className="flex items-center gap-1"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </>
            )}
          </Button>

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
      </div>

        {/* Empty State */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-600">Loading timeline...</p>
          </div>
        ) : validEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Timeline Data Yet</h4>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              {isGenerating 
                ? "Generating your personalized immigration timeline..." 
                : "Upload your visa-related documents to see your immigration journey."
              }
            </p>
            {!isGenerating && (
              <Button 
                onClick={() => generateTimeline(false)}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Timeline
              </Button>
            )}
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
                          w-7 h-7
                          rounded-full border-2 flex items-center justify-center bg-white shadow-sm
                          ${getStatusColor(event.status)}
                          transition-all duration-300 group-hover:scale-110
                        `}>
                          <div className="w-3.5 h-3.5">
                            {getEventIcon(event.eventType, event.visaType)}
                          </div>
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 w-64 shadow-xl">
                          <div className="font-medium mb-1">{event.title}</div>
                          <div className="text-gray-300 mb-1">{formatDate(event.date)}</div>
                          
                          {event.visaType && (
                            <div className="text-green-300 mb-1">🛂 {event.visaType}</div>
                          )}
                          {event.duration && (
                            <div className="text-blue-300 mb-1">⏱️ {event.duration}</div>
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
                        <>
                          <p className="font-medium text-sm text-gray-900 mb-1 leading-tight text-center">
                            {event.title}
                          </p>
                          <p className="text-xs text-gray-600 mb-2 text-center">
                            {formatDate(event.date)}
                          </p>
                          <div className="flex justify-center">
                            {getStatusBadge(event.status)}
                          </div>
                        </>
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
                      flex items-start gap-3 p-3 bg-white rounded-lg border shadow-sm min-w-[280px]
                      hover:shadow-md transition-all duration-200 ${getPriorityColor(event.priority)}
                    `}>
                      {/* Event Circle */}
                      <div className={`
                        w-8 h-8 
                        rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-white
                        ${getStatusColor(event.status)}
                      `}>
                        <div className="w-4 h-4">
                          {getEventIcon(event.eventType, event.visaType)}
                        </div>
                      </div>

                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900 leading-tight text-base">
                            {event.title}
                          </p>
                          <div className="ml-2 flex-shrink-0">
                            {getStatusBadge(event.status)}
                          </div>
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
                          {event.duration && (
                            <p className="text-sm text-purple-600 flex items-center gap-1">
                              ⏱️ <span>{event.duration}</span>
                            </p>
                          )}
                          {event.priority === 'high' && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              🔥 <span>High Priority</span>
                            </p>
                          )}
                          {event.description && (
                            <p className="text-xs text-gray-500 leading-relaxed mt-2">
                              {event.description}
                            </p>
                          )}
                          {event.aiInsights?.recommendation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-200">
                              <p className="text-xs text-blue-700 font-medium">AI Recommendation:</p>
                              <p className="text-xs text-blue-600">{event.aiInsights.recommendation}</p>
                            </div>
                          )}
                          {event.checklist && event.checklist.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-600 font-medium mb-1">Action Items:</p>
                              <ul className="text-xs text-gray-500 space-y-1">
                                {event.checklist.slice(0, 3).map((item, index) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                                {event.checklist.length > 3 && (
                                  <li className="text-gray-400">+{event.checklist.length - 3} more...</li>
                                )}
                              </ul>
                            </div>
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

export default VisaTimeline;
