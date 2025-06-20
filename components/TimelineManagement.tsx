"use client";

import React, { useState } from 'react';
import { TimelineEvent } from '@/lib/types/timeline.model';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Calendar, Edit3, Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface TimelineManagementProps {
  userId: string;
  events: TimelineEvent[];
  onEventUpdate: (eventId: string, updates: Partial<TimelineEvent>) => Promise<void>;
  onEventDelete: (eventId: string) => Promise<void>;
  onEventCreate: (event: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export const TimelineManagement: React.FC<TimelineManagementProps> = ({
  userId,
  events,
  onEventUpdate,
  onEventDelete,
  onEventCreate
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [editForm, setEditForm] = useState<Partial<TimelineEvent>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setEditForm(event);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent || !editForm.title || !editForm.status) return;

    setIsLoading(true);
    try {
      await onEventUpdate(selectedEvent.id, editForm);
      setIsEditDialogOpen(false);
      setSelectedEvent(null);
      setEditForm({});
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setIsLoading(true);
    try {
      await onEventDelete(eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!editForm.title || !editForm.status || !editForm.date) return;

    setIsLoading(true);
    try {
      await onEventCreate({
        title: editForm.title,
        status: editForm.status as 'completed' | 'current' | 'upcoming',
        date: editForm.date,
        description: editForm.description || '',
        documents: editForm.documents || [],
        documentsRequired: editForm.documentsRequired || [],
        checklist: editForm.checklist || [],
        aiInsights: editForm.aiInsights || { recommendation: '', links: [] },
        duration: editForm.duration,
        visaType: editForm.visaType,
        priority: editForm.priority || 'medium',
        eventType: editForm.eventType || 'milestone',
        employer: editForm.employer,
        additionalInfo: editForm.additionalInfo || {}
      });
      setIsCreateDialogOpen(false);
      setEditForm({});
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'current':
        return <Badge className="bg-blue-100 text-blue-800">Current</Badge>;
      case 'upcoming':
        return <Badge className="bg-gray-100 text-gray-600">Upcoming</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Timeline Management</h3>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Event
        </Button>
      </div>

      {/* Events List */}
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="font-medium">{event.title}</h4>
                {getStatusBadge(event.status)}
                {event.visaType && (
                  <Badge variant="outline" className="text-xs">{event.visaType}</Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <span>{formatDate(event.date)}</span>
                {event.description && <span className="ml-2">• {event.description}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(event)}
                className="p-2"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(event.id)}
                className="p-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Timeline Event</DialogTitle>
            <DialogDescription>
              Update the details of this timeline event.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">Title</Label>
              <Input
                id="title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={editForm.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visaType" className="text-right">Visa Type</Label>
              <Input
                id="visaType"
                value={editForm.visaType || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, visaType: e.target.value }))}
                className="col-span-3"
                placeholder="e.g., H-1B, F-1, Green Card"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="priority" className="text-right">Priority</Label>
              <Select
                value={editForm.priority}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value as any }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Timeline Event</DialogTitle>
            <DialogDescription>
              Add a new event to the timeline.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-title" className="text-right">Title</Label>
              <Input
                id="new-title"
                value={editForm.title || ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-status" className="text-right">Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="current">Current</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-date" className="text-right">Date</Label>
              <Input
                id="new-date"
                type="datetime-local"
                value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditForm(prev => ({ ...prev, date: new Date(e.target.value).toISOString() }))}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-description" className="text-right">Description</Label>
              <Textarea
                id="new-description"
                value={editForm.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimelineManagement;
