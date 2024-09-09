import { Component, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { AuthService } from '../../auth.service';
import { Router, ActivatedRoute, RouterLink, RouterModule } from '@angular/router';   

import * as L from 'leaflet';
import { latLng, tileLayer, Map, Marker } from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'; 
import 'leaflet-search'; 
import { GeoPoint } from 'firebase/firestore';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare module 'leaflet-geosearch' {
  export interface GeoSearchControl extends L.Control {
    search(query: string): void;
    on(type: string, fn: any, context?: any): this;
  }
}


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
  standalone: true,
  imports:[FormsModule, CommonModule, RouterLink, RouterModule]
})
export class CreateEventComponent implements OnInit {
  map: any;
  private searchControl!: GeoSearchControl;
  selectedLocation: { lat: number, lng: number } | null = null;
  event: any = {
    name: '',
    imageUrl: '',
    dateTime: '', // You might want to initialize this with the current date/time
    eventType: 'offline',
    location: null as GeoPoint | null,
    locationText: '',
    description: ''
  };
  eventId: string | null = null;
  isEditing: boolean = false;
  selectedImageFile: File | null = null; // To store the selected image file
  existingImageUrl: any;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
   }

   ngAfterViewInit() {
    console.log('Map container element:', document.getElementById('map'));
  
    if (this.event.eventType === 'offline') {
      this.initializeMap();
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.eventId = params.get('id');   
 
      if (this.eventId) {
        this.isEditing = true; 
        this.fetchEventDetails(); 
      } else {
        // If creating a new event, initialize dateTime with the current date/time
        this.event.dateTime = new Date().toISOString().slice(0, 16); // Format for datetime-local input
      }
    });
    // this.initializeMap();
    L.Icon.Default.imagePath = 'assets/';
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([17.3850, 78.4867], 13); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
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

    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        this.map.removeLayer(layer);
      }
    });

    const marker = L.marker(latlng).addTo(this.map);
    marker.bindPopup("Selected Location").openPopup();

    // Update location in the event object
    this.event.location = new GeoPoint(latlng.lat, latlng.lng);
  }

  onEventTypeChange() {
    if (this.event.eventType === 'offline') {
      this.selectedLocation = null; 
      this.event.location = null;
      this.event.locationText = '';

      // Initialize the map if it hasn't been initialized yet
      if (!this.map) {
        setTimeout(() => { // Add a slight delay
          this.initializeMap();
        }, 0); // 0 milliseconds is enough to trigger a re-render
      }
    } else {
      // If switching to online, you might want to clear the map and related data
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
      this.selectedLocation = null;
      this.event.location = null;
      this.event.locationText = '';
    }
  }

  async fetchEventDetails() {
    if (this.eventId) {
      try {
        this.event = await this.eventService.getEventById(this.eventId);

        // If it's an offline event, set the map view and marker
        if (this.event.eventType === 'offline' && this.event.location) {
          this.map.setView([this.event.location.latitude, this.event.location.longitude], 13);
          this.setSelectedLocation(L.latLng(this.event.location.latitude, this.event.location.longitude));
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        // Handle the error appropriately
      }
    }
  }

  async submitEvent() {
    const currentUser = await this.authService.getCurrentUser(); 
    if (currentUser) { 
      this.event.createdBy = currentUser.uid; // Add createdBy field
    } else {
      alert('user not found');
      return;
    }

    if (this.selectedImageFile) {
      try {
        this.event.imageUrl = await this.eventService.uploadEventImage(this.selectedImageFile);
      } catch (error) {
        console.error('Error uploading event image:', error);
        // Handle the error appropriately
      }
    }

    if (this.isEditing) {
      this.eventService.updateEvent(this.eventId!, this.event)
        .then(() => {
          alert('Event updated successfully!');
          this.router.navigate(['/event/overview']);
        })
        .catch(error => {
          console.error('Error updating event:', error);
        });
    } else {
      this.eventService.createEvent(this.event)
        .then(() => {
          alert('Event created successfully!');
          this.router.navigate(['/event/overview']);
        })
        .catch(error => {
          console.error('Error creating event:', error);
        });
    }
  }

  onImageSelected(event: any) {
    this.selectedImageFile = event.target.files[0];
    this.existingImageUrl = null; // Clear the existing image URL if a new file is selected
  }

  removeImage() {
    this.selectedImageFile = null;
    this.existingImageUrl = null; 

    // If editing and there's an existing image URL, delete it from storage
    if (this.isEditing && this.event.imageUrl) {
      this.eventService.deleteEventImage(this.event.imageUrl)
        .catch(error => {
          console.error('Error deleting event image:', error);
          // Handle the error appropriately
        });
    }
  }

  getPreviewUrl(file: File | null): string | ArrayBuffer | null {
    if (file) {
      return URL.createObjectURL(file);
    } else if (this.existingImageUrl) {
      return this.existingImageUrl; // Use the existing image URL if no new file is selected
    } else {
      return null;
    }
  }

}
