import { Injectable } from '@angular/core';
import { 
    Firestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc,
    updateDoc,
    deleteDoc,
    arrayUnion,
    arrayRemove,
    getDoc,
    query,
    where
} from '@angular/fire/firestore';
import { deleteObject, getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  constructor(private firestore: Firestore, private storage: Storage) {} 

  async createEvent(eventData: any) {
    try {
      const eventsCollection = collection(this.firestore, 'events');
      const docRef = await addDoc(eventsCollection, eventData);
      console.log('Event created with ID:', docRef.id);
      return docRef.id; 
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  async getAllEvents(): Promise<any[]> {
    try {
      const eventsCollection = collection(this.firestore, 'events');
      const querySnapshot = await getDocs(eventsCollection);

      const events: any = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({ id: doc.id, ...eventData });
      });

      return events;
    } catch (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
  }

  async getEventById(eventId: string): Promise<any> {
    try {
      const eventDocRef = doc(this.firestore, 'events', eventId);
      const docSnap = await getDoc(eventDocRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.error('Event not found with ID:', eventId);
        throw new Error('Event not found'); 
      }
    } catch (error) {
      console.error('Error fetching event by ID:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, eventData: any) {
    try {
      const eventDocRef = doc(this.firestore, 'events', eventId);
      await updateDoc(eventDocRef, eventData);
      console.log('Event updated successfully:', eventId);
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string) {
    try {
      const eventDocRef = doc(this.firestore, 'events', eventId);
      await deleteDoc(eventDocRef);
      console.log('Event deleted successfully:', eventId);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  async toggleUserInterest(eventId: string, userId: string) {
    try {
      const eventDocRef = doc(this.firestore, 'events', eventId);

      // Atomically add or remove the user from the interestedMembers array
      await updateDoc(eventDocRef, {
        interestedMembers: arrayUnion(userId) // Add if not present
      }).catch(async (error) => {
        if (error.code === 'already-exists') {
          await updateDoc(eventDocRef, {
            interestedMembers: arrayRemove(userId) // Remove if present
          });
        } else {
          throw error; // Re-throw other errors
        }
      });
    } catch (error) {
      console.error('Error toggling user interest:', error);
      throw error;
    }
  }

  async getEventsCreatedByUser(userId: string): Promise<any[]> {
    try {
      const eventsQuery = query(collection(this.firestore, 'events'), where('createdBy', '==', userId));
      const querySnapshot = await getDocs(eventsQuery);

      const events: any = [];
      querySnapshot.forEach((doc) => {
        const eventData = doc.data();
        events.push({ id: doc.id, ...eventData });
      });

      return events;
    } catch (error) {
      console.error('Error fetching events created by user:', error);
      return [];
    }
  }

  async uploadEventImage(file: File): Promise<string> {
    const filePath = `events/${new Date().getTime()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading event image:', error);
      throw error;
    }
  }

  async deleteEventImage(imageUrl: string) {
    try {
      const storageRef = ref(this.storage, imageUrl); 
      await deleteObject(storageRef);
      console.log('Event image deleted successfully:', imageUrl);
    } catch (error) {
      console.error('Error deleting event image:', error);
      throw error;
    }
  }

}