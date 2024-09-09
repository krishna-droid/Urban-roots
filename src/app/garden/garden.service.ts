import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, GeoPoint, query, where, getDocs, deleteDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { distanceBetween, geohashQueryBounds } from 'geofire-common';
import * as firebase from 'firebase/app';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GardenService {


  constructor(private firestore: Firestore, private storage: Storage) {
  }

  async createGarden(gardenData: any) {
    try {
      const gardenCollection = collection(this.firestore, 'gardens');
      const docRef = await addDoc(gardenCollection, gardenData);
      console.log('Garden added with ID:', docRef.id);

      if (gardenData.images && gardenData.images.length > 0) {
        await this.updateGardenImages(docRef.id, gardenData.images);
      }

      return docRef.id;
    } catch (error) {
      console.error('Error creating garden:', error);
      throw error;
    }
  }
  
  async uploadFile(file: File): Promise<string> { // Return the download URL
    const filePath = `garden_images/${new Date().getTime()}_${file.name}`; 
    const storageRef = ref(this.storage, filePath);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error; // Re-throw the error for the component to handle
    }
  }


  async deleteImage(imageUrl: string) {
    try {
      const storageRef = ref(this.storage, imageUrl); 
      await deleteObject(storageRef);
      console.log('Image deleted successfully:', imageUrl);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error; // Re-throw the error for the component to handle
    }
  }



  async getAllGardens(): Promise<any[]> {
    try {
      const gardenCollection = collection(this.firestore, 'gardens');
      const querySnapshot = await getDocs(gardenCollection);

      const gardens: any[] | PromiseLike<any[]> = [];
      querySnapshot.forEach((doc: any) => {
        const gardenData = doc.data();
        gardens.push({ id: doc.id, ...gardenData });
      });
      console.log('gardens',gardens);
      
      return gardens;
    } catch (error) {
      console.error('Error fetching all gardens:', error);
      return []; // Or throw an error if you prefer
    }
  }

  async getNearbyGardens(lat: number, lon: number, radiusInKm: number): Promise<{ matchingDocs: any[], bounds: any[] }> { 
    const center: any = new GeoPoint(lat, lon);
    const fieldPath = 'geohash'; 
    const centerCoordinates: [number, number] = [center.latitude, center.longitude];

    console.log('lat',lat);
    console.log('lon',lon);
    
    console.log('centerCoordinates',centerCoordinates);
    console.log('center',center);
    const kms = radiusInKm * 1000;
    //  Get the list of geohashes to query
    const bounds = geohashQueryBounds(centerCoordinates, kms);
    console.log('bounds',bounds);
    
    const promises = [];
    for (const b of bounds) {
      const q = query(collection(this.firestore, 'gardens'), 
        where(fieldPath, '>=', b[0]),
        where(fieldPath, '<=', b[1])
      );
      promises.push(getDocs(q));
    }

    // Collect all the query results together into a single list
    const snapshots = await Promise.all(promises);
    
    const matchingDocs: any[] = [];

    for (const snap of snapshots) {
      for (const doc of snap.docs) {
        const lat = doc.get('location').latitude;
        const lng = doc.get('location').longitude;

        // We have to filter out a few false positives due to GeoHash accuracy, but
        // most will match
        const distanceInKm = distanceBetween([lat, lng],   
 [center.latitude, center.longitude]);
        if (distanceInKm <= radiusInKm) {
          matchingDocs.push({ id: doc.id, ...doc.data() });
        }
      }
    }
    
    return { matchingDocs, bounds };
    }



  async getGardensByUserId(userId: string): Promise<any[]> {
    try {
      const gardensQuery = query(collection(this.firestore, 'gardens'), where('userId', '==', userId));
      const querySnapshot = await getDocs(gardensQuery);

      const gardens: any = [];
      querySnapshot.forEach((doc: any) => {
        const gardenData = doc.data();
        gardens.push({ id: doc.id, ...gardenData });
      });

      return gardens;
    } catch (error) {
      console.error('Error fetching gardens by user ID:', error);
      return []; // Or throw an error if you prefer
    }
  }

  async deleteGarden(gardenId: string) {
    try {
      // Delete garden document from Firestore
      const gardenDocRef = doc(this.firestore, 'gardens', gardenId);
      await deleteDoc(gardenDocRef);

      // Delete associated images from Firebase Storage (if applicable)
      // ... (You'll need to implement this based on how you store image URLs)

      console.log('Garden deleted successfully:', gardenId);
    } catch (error) {
      console.error('Error deleting garden:', error);
      throw error;
    }
  }

  async getGardenById(gardenId: string): Promise<any> {
    try {
      const gardenDocRef = doc(this.firestore, 'gardens', gardenId);
      const docSnap = await getDoc(gardenDocRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        console.error('Garden not found with ID:', gardenId);
        throw new Error('Garden not found'); // Or handle this error differently
      }
    } catch (error) {
      console.error('Error fetching garden by ID:', error);
      throw error;
    }
  }

  async updateGarden(gardenId: string, gardenData: any) {
    try {
      const gardenDocRef = doc(this.firestore, 'gardens', gardenId);
      await updateDoc(gardenDocRef, gardenData);
      console.log('Garden updated successfully:', gardenId);
    } catch (error) {
      console.error('Error updating garden:', error);
      throw error;
    }
  }

  async updateGardenImages(gardenId: string, imageUrls: string[]) {
    try {
      const gardenDocRef = doc(this.firestore, 'gardens', gardenId);
      await updateDoc(gardenDocRef, { images: imageUrls });
    } catch (error) {
      console.error('Error updating garden images:', error);
      throw error;
    }
  }

  //not using 
  // async getGardensBylatlon(lat: any, lon: any) {
  //   const center = this.geofirex.point(lat, lon);
  //   const radius = 10; // km
  //   const field = 'position';
  //   const garden = this.geofirex.query('stores').within(center, radius, field, { log: true });

  //   return garden.pipe(
  //     map((arr: any) => {
  //         // arr.find(o => o.id === this.docId)
  //         return arr.map((dataItem: any) => {
  //             // const data = dataItems.payload.doc.data(),
  //             //   id = dataItems.payload.doc.id;

  //             return { ...dataItem };
  //         });
  //     })
  // );
  // }

}