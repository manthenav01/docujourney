import { Timestamp } from "firebase/firestore";

export interface DocumentMetaDataModel {
    name: string;
    url: string;
    uploadedAt?: string;
    id: string;
    status: string;
    filePath: string;
    extracted: DocumentExtractedResponseData | null;
  }

  export interface DocumentExtractedResponseData {
    beneficiary: string,
      receipt_number: string,
      valid_from: Timestamp,
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