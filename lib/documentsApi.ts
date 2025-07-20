import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { DocumentMetaDataAPIModel } from './types/document.model';

// Define Schema interface


export async function fetchUserDocuments(userId: string, profileId: string): Promise<DocumentMetaDataAPIModel[]> {
  const documentsRef = collection(db, `users/${userId}/profiles/${profileId}/documents`);
  const querySnapshot = await getDocs(documentsRef);
  const documents: DocumentMetaDataAPIModel[] = [];

  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() } as DocumentMetaDataAPIModel);
  });

  return documents;
}
