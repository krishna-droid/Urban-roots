import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { provideAuth,   
  getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage'; // Import and provide Storage
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
    provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration()]
};
