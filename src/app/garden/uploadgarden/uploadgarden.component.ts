import { Component, inject, OnInit } from '@angular/core';
import { GardenService } from '../garden.service'; 
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { latLng, tileLayer, Map, Marker, icon } from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'; 
import 'leaflet-search'; 
import { AuthService } from '../../auth.service';
import { GeoPoint } from 'firebase/firestore';
import {  FirestoreModule, provideFirestore } from '@angular/fire/firestore';
import {  geohashForLocation } from 'geofire-common'; 

import 'firebase/compat/firestore';

declare module 'leaflet-geosearch' {
  export interface GeoSearchControl extends L.Control {
    search(query: string): void;
    on(type: string, fn: any, context?: any): this;
  }
}

@Component({
  selector: 'app-upload-garden',
  templateUrl: './uploadgarden.component.html', 
  styleUrls: ['./uploadgarden.component.css'],
  standalone: true, 
  imports: [FormsModule, CommonModule, RouterLink, RouterModule, FirestoreModule ],

})
export class UploadGardenComponent implements OnInit {


  map: any;
  private searchControl!: GeoSearchControl;
  selectedLocation: { lat: number, lng: number } | null = null;
  garden: any = { 
    name: '' as any,
    description: '',
    type: 'community', 
    images:  [] as string[],
    latitude: 0, 
    longitude: 0 ,
    username: '',
    userId: '',
    location: null as GeoPoint | null, 
    geohash: '' ,
    position: {} as any,
    sqft:0
  };
  gardenId: string | null = null; 
  isEditing: boolean = false; // Flag to indicate if we're editing or creating a new garden


  constructor( private gardenService: GardenService, private router: Router, private authService: AuthService, private route: ActivatedRoute 
  ) {
  } 

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
           this.gardenId = params.get('id'); 
           if (this.gardenId) {
             this.isEditing = true; 
             this.fetchGardenDetails(); 
           }
         });
    this.initializeMap();
    L.Icon.Default.imagePath = 'assets/';
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([17.3850, 78.4867], 13); 

    tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    const provider = new OpenStreetMapProvider();
    this.searchControl = new (GeoSearchControl as any)({
      provider: provider,
    });
    this.map.addControl(this.searchControl);

    this.map.on('click', (event: L.LeafletMouseEvent) => {
      this.setSelectedLocation(event.latlng);
    });

    this.map.on('geosearch/showlocation', (e: any) => {
        this.setSelectedLocation(e.location.latlng);
    });
  }

  searchLocation(event: any) {
    const searchTerm = event.target.value;
    this.searchControl.search(searchTerm); 
  }

  setSelectedLocation(latlng: L.LatLng) {
    this.selectedLocation = { lat: latlng.lat, lng: latlng.lng };
    this.garden.latitude = latlng.lat;
    this.garden.longitude = latlng.lng;

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const marker = L.marker(latlng).addTo(this.map);
    marker.bindPopup("Selected Location").openPopup();
  }

  requestLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        this.map.setView([lat, lng], 13);
        this.setSelectedLocation(L.latLng(lat, lng));
      }, (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to retrieve your location.');
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        this.gardenService.uploadFile(file)
          .then((downloadURL: any) => {
            this.garden.images.push(downloadURL);
          })
          .catch(error => {
            console.error('Error uploading file:', error);
            // Handle the error appropriately
          });
      }
    }
  }

  deleteImage(index: number) {
    if (confirm('Are you sure you want to delete this image?')) {
      const imageUrlToDelete = this.garden.images[index];

      this.gardenService.deleteImage(imageUrlToDelete)
        .then(() => {
          // Remove from the garden.images array
          this.garden.images.splice(index, 1);
        })
        .catch(error => {
          console.error('Error deleting image:', error);
          // Handle the error appropriately (e.g., show an error message to the user)
        });
    }
  }

  async uploadGarden() {
    const currentUser = await this.authService.getCurrentUser(); 
    if (currentUser) { 
      this.garden.userId = currentUser.uid;
      this.garden.username = currentUser.displayName || '';
    } else {
      alert('user not found');
      return
    }

    // Add user information to the garden data
    if (this.selectedLocation) {
      const geopoint = new GeoPoint(this.selectedLocation.lat, this.selectedLocation.lng);
      this.garden.location = geopoint;
      const point: any = [
        this.selectedLocation.lat, this.selectedLocation.lng
      ]
      this.garden.geohash = geohashForLocation(point);      

      this.garden.position = {
        geohash: this.garden.geohash,
        geopoint: this.garden.location
      }
    }

    if (this.isEditing) {
      this.gardenService.updateGarden(this.gardenId!, this.garden)
        .then(() => {
          alert('Garden updated successfully!');
          this.router.navigate(['/user/dashboard']);
        })
        .catch((error: any) => {
          console.error('Error updating garden:', error);
        });
    } else {
      this.gardenService.createGarden(this.garden)
        .then(async (gardenId: any) => {
          if (this.garden.images && this.garden.images.length > 0) {
            await this.gardenService.updateGardenImages(gardenId, this.garden.images);
          }

          alert('Garden uploaded successfully!');
          this.router.navigate(['/user/dashboard']);
        })
        .catch(error => {
          console.error('Error uploading garden:', error);
        });
    }

    // this.gardenService.createGarden(this.garden)
    // .then(() => {
    //   // Show a success alert (you'll need to implement this based on your UI library)
    //   alert('Garden uploaded successfully!');

    //   // Navigate to the dashboard
    //   this.router.navigate(['/user/dashboard']);
    // })
    //   .catch(error => {
    //     console.error('Error uploading garden:', error);
    //   });
  }

  async fetchGardenDetails() {
    if (this.gardenId) {
      try {
        this.garden = await this.gardenService.getGardenById(this.gardenId);
        this.map.setView([this.garden.latitude, this.garden.longitude], 13);
        this.setSelectedLocation(L.latLng(this.garden.latitude, this.garden.longitude));
      } catch (error) {
        console.error('Error fetching garden details:', error);
      }
    }
  }
  
}
