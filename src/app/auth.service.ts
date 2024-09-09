import { Injectable } from '@angular/core';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, onAuthStateChanged, User, updateProfile } from '@angular/fire/auth';
import { 
  Auth, 
} from '@angular/fire/auth';
import   
{ Firestore, collection, doc,   
setDoc, serverTimestamp,  
getDoc,
updateDoc,
query,
where,
getDocs} from '@angular/fire/firestore';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';
import { Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class AuthService {
 currentUser: any;
  constructor(private auth: Auth, private firestore: Firestore, private router: Router,  private storage: Storage) {
    
  onAuthStateChanged(this.auth, (user) => {
    if (user) {
      this.currentUser = user;
      // User is logged in, redirect to dashboard
      this.router.navigate(['/user/dashboard']);
    } else {
      // User is logged out, redirect to login (or home page)
      this.router.navigate(['/']); 
    }
  });
  }

  async signup(email: string, password: string, name: string) {
       try {
         const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
         const user = userCredential.user;
         
         await updateProfile(user, { displayName: name });

         // Create user document in Firestore
         const userDocRef = doc(collection(this.firestore, 'usercollection'), user.uid);
         await setDoc(userDocRef, { email,name, createdOn: serverTimestamp()  }); // You can add more fields as needed
   
         console.log('User registered and document created:', user);
       } catch (error) {
         throw error; // Re-throw the error for the component to handle
       }
     }

  async login(email: string, password: string) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
  }

  logout() {
    const auth = getAuth();
     signOut(auth);
     this.router.navigate(['/']); // Redirect to login after logout
     return
  }

  async forgotPassword(email: string) {
    const auth = getAuth();
    return sendPasswordResetEmail(auth, email);
  }

  getUserId(): string | null {
    return this.currentUser ? this.currentUser.uid : null;
  }

  async getUsername(): Promise<string | null> {
    return this.currentUser ? this.currentUser.displayName : null;
  }


  async fetchProfileImageUrl(): Promise<string | null> {
    const userId = this.getUserId();
    if (!userId) { 
      console.error('User not authenticated. Cannot fetch profile image URL.');
      return null; // Or throw an error if you prefer
    }
  
    try {
      const userDocRef = doc(this.firestore, 'usercollection', userId);
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        return userDocSnap.data()['profileImageUrl'] || null;
      } else {
        return null; 
      }
    } catch (error) {
      console.error('Error fetching profile image URL:', error);
      return null;
    }
  }

  async uploadProfileImage(file: File): Promise<string> {
    const filePath = `profile_images/${this.getUserId()}_${new Date().getTime()}_${file.name}`;
    const storageRef = ref(this.storage, filePath);

    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  async updateProfileImageUrlInFirestore(imageUrl: string) {
    try {
      const userDocRef = doc(this.firestore, 'usercollection', this.getUserId()!);
      await updateDoc(userDocRef, { profileImageUrl: imageUrl });
    } catch (error) {
      console.error('Error updating profile image URL in Firestore:', error);
      throw error; 
    }
  }

  async updateUsername(newUsername: string) {
    try {
      const currentUser = await this.getCurrentUser(); // Await the Promise
      if (currentUser) { 
        // Update username in Firebase Auth
        await updateProfile(currentUser, { displayName: newUsername });

        // Update username in Firestore
        const userDocRef = doc(this.firestore, 'usercollection', this.getUserId()!);
        await updateDoc(userDocRef, { name: newUsername });
      } else {
        console.error('User not authenticated. Cannot update username.');
        // You might want to throw an error or handle this case differently
      }
    } catch (error) {
      console.error('Error updating username:', error);
      throw error;
    }
  }


  getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      if (this.currentUser) { // Check if currentUser is already available
        resolve(this.currentUser);
      } else {
        const unsubscribe = onAuthStateChanged(this.auth, (user) => {
          this.currentUser = user;
          resolve(user);
          unsubscribe(); // Unsubscribe after resolving to avoid memory leaks
        });
      }
    });
  }

  async getUsernamesFromUids(uids: string[]): Promise<string[]> {
    if (!uids || uids.length === 0) return []; 

    try {
      // Query Firestore to get user documents for the given UIDs
      const userDocsQuery = query(collection(this.firestore, 'usercollection'), where('__name__', 'in', uids));
      const querySnapshot = await getDocs(userDocsQuery);

      const usernames = querySnapshot.docs.map(doc => doc.data()['name'] || 'Anonymous');
      return usernames;
    } catch (error) {
      console.error('Error fetching usernames:', error);
      return [];
    }
  }

}