"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc as firestoreDoc, onSnapshot } from 'firebase/firestore';
import { DocumentTypeSchemaModel } from '@/lib/documentActions';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { DocumentMetaDataAPIModel, DocumentMetaDataTransformedModel } from '@/lib/types/document.model';
import { transformDocumentMetaData } from '@/utils/documentUtils';

interface UploadDocumentDialogProps {
  userId: string;
  profileId: string;
  documentSchemas: Record<string, DocumentTypeSchemaModel>;
}

export default function UploadDocumentDialog({ userId, profileId, documentSchemas }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [docRefId, setDocRefId] = useState<string>();
  const [docData, setDocData] = useState<DocumentMetaDataTransformedModel | null>(null);
  const [formFields, setFormFields] = useState<Record<string, any> | null>(null);
  // const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const form = useForm<{ [key: string]: any }>({ defaultValues: {} });
  // reset form when extracted fields load
  // reset form values when extracted fields load
  useEffect(() => {
    if (formFields) {
      form.reset({});
    }
  }, [formFields]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const [popoverOpen, setPopoverOpen] = useState(false);

  // Listen for document status to become 'completed', then load extracted fields
  useEffect(() => {
    if (!docRefId) return;
    const docRef = firestoreDoc(db, `users/${userId}/profiles/${profileId}/documents`, docRefId);
    const unsub = onSnapshot(docRef, (snap) => {
      const data = snap.data() as DocumentMetaDataAPIModel;
      if (data?.status === 'completed' && data.extracted) {
        const transformedData = transformDocumentMetaData(data);
        
        setDocData({ ...transformedData, id: snap.id });
          const documentType = transformedData?.extracted?.document_type;
          if ( !documentType || !documentSchemas[documentType]) {
            console.error(`Document type ${documentType} not found in schemas`);
            return;
          }
        const fields = documentSchemas[documentType].fields
          .filter((f) => f.editable);
        const extractedFields = fields.reduce((acc, field) => {
          acc[field.key] = (transformedData.extracted as Record<string, any>)?.[field.key];
          return acc;
        }, {} as Record<string, any>);
        setFormFields(extractedFields);
      }
    });
    return () => unsub();
  }, [docRefId, userId, profileId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const startUpload = async () => {
    if (!file) return;
    // 1) Create Firestore stub record
    const docCollection = collection(db, `users/${userId}/profiles/${profileId}/documents`);
    const stub = await addDoc(docCollection, { status: 'uploaded', name: file.name, extracted: null, url: '', filePath: '', uploadedAt: new Date().toISOString() });
    setDocRefId(stub.id);
    // 2) Upload to Storage under a folder matching Firestore doc path
    const storage = getStorage();
    const path = `uploads/${userId}/${profileId}/${stub.id}/${file.name}`;
    const sRef = storageRef(storage, path);
    const uploadTask = uploadBytesResumable(sRef, file);
    uploadTask.on('state_changed', snap => {
      const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
      setUploadProgress(Math.round(progress));
      // update status
      updateDoc(stub, { filePath: path });
    }, err => {
      console.error(err);
    }, async () => {
      const url = await getDownloadURL(sRef);
      await updateDoc(stub, { url, status: 'processing' });
    });
  };


  // Render verification form with shadcn form components

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Upload Document</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Select a file to upload and verify extracted data.</DialogDescription>
        </DialogHeader>
      
        {!file && (
          <div>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Choose File</Button>
          </div>
        )}

        {file && !formFields && (
          <div>
            <p className="py-2">Uploading: {file.name}</p>
            <progress value={uploadProgress} max={100} className="w-full" />
            <Button onClick={startUpload} disabled={uploadProgress > 0}>Start Upload</Button>
          </div>
        )}

        {formFields && (
          <div>
            <Separator orientation="horizontal" />
            <DialogTitle>Verify Extracted Data</DialogTitle>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(async (values) => {
                  if (!docRefId) return;
                  const ref = firestoreDoc(
                    db,
                    `users/${userId}/profiles/${profileId}/documents`,
                    docRefId
                  );
                  await updateDoc(ref, { extracted: values, status: 'verified' });
                  // reset state
                  setOpen(false);
                  setFile(null);
                  setDocRefId(undefined);
                  setFormFields(null);
                })}
                className="space-y-4"
              >
                {Object.entries(formFields).map(([key, value]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field: controllerField }) => (
                      <FormItem>
                        <FormLabel>{key}</FormLabel>
                        <FormControl>
                          {typeof value === 'object' && value instanceof Date ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                >
                                  <CalendarIcon />
                                  {value.toLocaleDateString()}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 ignore-modal-close z-[90] pointer-events-auto" align="start">
                                <Calendar
                                  mode="single"
                                  selected={value}
                                  onSelect={(date) => {
                                    console.log("Selected date:", date);
                                    if (date) {
                                      form.setValue(key, date);
                                      form.trigger(key);
                                    }
                                  }}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <Input {...controllerField} defaultValue={value} />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
