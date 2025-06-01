import { getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc } from 'firebase/firestore';

/**
 * Upload file to Firebase Storage and create Firestore document
 */
export const uploadFileToStorage = async (
  file: File,
  userId: string,
  profileId: string,
  onProgress: (progress: number) => void
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1) Create Firestore stub record
      const docCollection = collection(db, `users/${userId}/profiles/${profileId}/documents`);
      const stub = await addDoc(docCollection, {
        status: 'uploaded',
        name: file.name,
        extracted: null,
        url: '',
        filePath: '',
        uploadedAt: new Date().toISOString()
      });
      
      // 2) Upload to Storage
      const storage = getStorage();
      const path = `uploads/${userId}/${profileId}/${stub.id}/${file.name}`;
      const sRef = storageRef(storage, path);
      const uploadTask = uploadBytesResumable(sRef, file);
      
      uploadTask.on(
        'state_changed',
        (snap) => {
          const progress = (snap.bytesTransferred / snap.totalBytes) * 100;
          onProgress(Math.round(progress));
          updateDoc(stub, { filePath: path });
        },
        (err) => {
          console.error('Upload error:', err);
          reject(new Error('Failed to upload file. Please try again.'));
        },
        async () => {
          try {
            const url = await getDownloadURL(sRef);
            await updateDoc(stub, { url, status: 'processing' });
            resolve(stub.id);
          } catch (err) {
            console.error('Error getting download URL:', err);
            reject(new Error('Failed to complete upload. Please try again.'));
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      reject(new Error('Failed to start upload. Please try again.'));
    }
  });
};
