import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Stepper } from '@/components/ui/stepper';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

interface DocumentVerificationFormProps {
  formFields: Record<string, any>;
  documentType: string;
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
  documentId: string;
  userId: string;
  profileId: string;
  onSubmit: (values: Record<string, any>) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
  isLoading?: boolean;
}

export const DocumentVerificationForm: React.FC<DocumentVerificationFormProps> = ({
  formFields,
  documentType,
  documentSchemas,
  documentId,
  userId,
  profileId,
  onSubmit,
  onCancel,
  onDelete,
  onBack,
  showBackButton = false,
  isLoading = false
}) => {
  const form = useForm<{ [key: string]: any }>({ defaultValues: {} });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get the schema for the current document type
  const schema = documentSchemas[documentType];
  const editableFields = schema?.fields.filter(field => field.editable) || [];

  useEffect(() => {
    if (formFields) {
      form.reset(formFields);
    }
  }, [formFields, form]);

  const handleSubmit = async (values: Record<string, any>) => {
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Error submitting verification:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/deleteDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profileId, documentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      if (onDelete) {
        onDelete();
      } else {
        onCancel(); // Fall back to cancel if no onDelete provided
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const renderField = (field: any, controllerField: any) => {
    const isDateField = field.type === 'date' || field.type === 'timestamp';
    
    if (isDateField) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-start h-11 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-colors"
            >
              <CalendarIcon className="h-4 w-4 mr-3 text-gray-500" />
              <span className={controllerField.value ? "text-gray-900" : "text-gray-500"}>
                {controllerField.value 
                  ? new Date(controllerField.value).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Select date'
                }
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0 ignore-modal-close z-[90] pointer-events-auto shadow-lg border-gray-200" 
            align="start"
          >
            <Calendar
              mode="single"
              selected={controllerField.value ? new Date(controllerField.value) : undefined}
              onSelect={(date) => {
                if (date) {
                  controllerField.onChange(date.toISOString());
                }
              }}
              initialFocus
              className="rounded-md"
            />
          </PopoverContent>
        </Popover>
      );
    }
    
    // Handle different input types based on field type
    const getInputType = () => {
      switch (field.type) {
        case 'number':
          return 'number';
        case 'email':
          return 'email';
        case 'tel':
        case 'phone':
          return 'tel';
        case 'url':
          return 'url';
        default:
          return 'text';
      }
    };

    const getInputIcon = () => {
      switch (field.type) {
        case 'email':
          return '✉️';
        case 'tel':
        case 'phone':
          return '📞';
        case 'url':
          return '🌐';
        case 'number':
          return '#️⃣';
        default:
          return '📝';
      }
    };
    
    return (
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm">
          {getInputIcon()}
        </div>
        <Input 
          {...controllerField} 
          type={getInputType()}
          placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
          className="pl-10 h-11 bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(90vh-120px)]">
      <div className="flex-shrink-0 pb-3 border-b border-gray-100 mb-4">
        {/* Stepper Header */}
        {showBackButton && (
          <Stepper 
            steps={[
              { title: "Document Type", description: "Select type" },
              { title: "Verify Data", description: "Review fields" }
            ]}
            currentStep={1}
            className="mb-4"
          />
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {showBackButton ? 'Verify Extracted Data' : 'Review Document Information'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Review and edit the extracted information below. Required fields are marked with *
            </p>
          </div>
          
          {showBackButton && onBack && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              disabled={isLoading || isDeleting}
              className="flex items-center gap-2 text-sm px-3 py-2 h-9"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pb-4">
            <div className="grid gap-4">
              {editableFields.map((field, index) => (
                <FormField
                  key={field.key}
                  control={form.control}
                  name={field.key}
                  rules={{
                    required: field.required ? `${field.label} is required` : false,
                    ...(field.type === 'email' && {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    }),
                    ...(field.type === 'number' && {
                      pattern: {
                        value: /^\d+$/,
                        message: 'Please enter a valid number'
                      }
                    })
                  }}
                  render={({ field: controllerField }) => (
                    <div>
                      <FormItem className="space-y-2 p-3 rounded-lg border border-gray-100 bg-white">
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            {index + 1}
                          </span>
                          <span>{field.label}</span>
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            {renderField(field, controllerField)}
                          </div>
                        </FormControl>
                        {field.description && (
                          <div className="bg-gray-50 p-2 rounded border-l-2 border-gray-200">
                            <p className="text-xs text-gray-500 flex items-start gap-1">
                              <span className="text-gray-400">💡</span>
                              <span>{field.description}</span>
                            </p>
                          </div>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    </div>
                  )}
                />
              ))}
            </div>
          </form>
        </Form>
      </div>
      
      <div className="flex-shrink-0 bg-white pt-4 mt-4 border-t border-gray-100">
        <DialogFooter className="gap-3 sm:gap-2">
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="flex-1 sm:flex-none h-10 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading || isDeleting}
              className="flex-1 sm:flex-none h-10 border-gray-200"
            >
              Cancel
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || isDeleting}
            onClick={form.handleSubmit(handleSubmit)}
            className="flex-1 sm:flex-none h-10 bg-blue-600"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Document
              </>
            )}
          </Button>
        </DialogFooter>
      </div>
    </div>
  );
};
