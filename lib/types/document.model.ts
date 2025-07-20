import { Timestamp } from 'firebase/firestore';

export interface DocumentMetaDataTransformedModel {
  name: string;
  url: string;
  uploadedAt?: string;
  createdAt: string;
  id: string;
  status: string;
  filePath: string;
  extracted: DocumentExtractedTransformedData | null;
}

export interface DocumentExtractedTransformedData {
  beneficiary?: string,
  receipt_number?: string,
  valid_from?: string,
  valid_to?: string,
  first_name?: string
  last_name?: string,
  notice_date?: string,
  document_type: string,
  visa_number?: string,
  alien_number?: string,
  country_of_origin?: string,
  country_of_citizen?: string,
  country_of_birth?: string,
  date_of_birth?: string,
  date_of_entry?: string,
  date_of_adjustment?: string,
  petitioner?: string,
  petitioner_address?: string,
  class_of_admission?: string,
}


export interface DocumentMetaDataAPIModel {
  name: string;
  url: string;
  uploadedAt?: Timestamp;
  createdAt: Timestamp;
  id: string;
  status: string;
  filePath: string;
  extracted: DocumentExtractedResponseAPIData | null;
}

export interface DocumentExtractedResponseAPIData {
  beneficiary: string,
  receipt_number: string,
  valid_from: Timestamp ,
  valid_to: Timestamp,
  first_name: string
  last_name: string,
  notice_date: Timestamp,
  document_type: string,
  visa_number: string,
  alien_number: string,
  country_of_origin: string,
  country_of_citizen: string,
  country_of_birth: string,
  date_of_birth: Timestamp,
  date_of_entry: Timestamp,
  date_of_adjustment: Timestamp,
  petitioner: string,
  petitioner_address: string,
}