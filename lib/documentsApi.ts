import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { DocumentMetaDataModel } from "./types/document.model";

// Define Schema interface


export async function fetchUserDocuments(userId: string, profileId: string): Promise<DocumentMetaDataModel[]> {
  const documentsRef = collection(db, `users/${userId}/profiles/${profileId}/documents`);
  const querySnapshot = await getDocs(documentsRef);
  const documents: DocumentMetaDataModel[] = [];

  querySnapshot.forEach((doc) => {
    documents.push({ id: doc.id, ...doc.data() } as DocumentMetaDataModel);
  });

  return documents;
}
