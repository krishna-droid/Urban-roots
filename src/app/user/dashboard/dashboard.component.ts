import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { AuthService } from '../../auth.service';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'; 
import { GardenService } from '../../garden/garden.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Geohash from 'latlon-geohash'; // Import a geohash library


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
    standalone: true, // If DashboardComponent is also standalone
  imports: [RouterLink, RouterModule, CommonModule, FormsModule ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DashboardComponent implements OnInit {
  nearbyGardens: any[] = []; // To store fetched nearby gardens
  map: any;
  private searchControl!: GeoSearchControl;
  userMarker: any; // To store the user's marker
  filter = {
    distance: 5, 
    category: '', 
    minSqft: 0, // Add minSqft filter
    maxSqft: 100  // Add maxSqft filter
  };
  radiusCircle: any = null; // To store the radius circle
  selectedCenter: any | null = null; // To store the selected center point
  templatlong: any;
  showModal: boolean = false;
  garden: any;
  open = false;
  
  constructor(
    private authService: AuthService,
     public dialog: MatDialog,
      private router: Router,
      private gardenService: GardenService
  ) {

   }

  ngOnInit(): void {


    this.initMap();
    this.getUserLocation();
    L.Icon.Default.imagePath = 'assets/';
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      console.log('event', event);
      
      this.setSelectedCenter(event.latlng);
    });
  }

  navigateTo(page: string) {
    // Logic to navigate to different pages
  }

  uploadGarden() {
    // Logic to upload garden
  }

  manageGarden() {
    // Logic to manage garden
  }

  showNearbyGardens() {
    // Logic to show nearby gardens
  }

  filterGardens() {
    // Logic to filter gardens
  }

  initMap(): void {
    this.map = L.map('map').setView([51.505, -0.09], 50)

    const provider = new OpenStreetMapProvider();
    this.searchControl = new (GeoSearchControl as any)({
      provider: provider,
    });
    this.map.addControl(this.searchControl);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const myLocationButton = L.control.attribution({ position: 'topright' });
    myLocationButton.onAdd = (map: L.Map) => {
      const div = L.DomUtil.create('div', 'leaflet-control-locate leaflet-bar leaflet-control');
      const icon = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', div);
      icon.title = 'My location';
    
      icon.innerHTML = '<i class="fas fa-map-marker-alt"></i>'; // You can use any suitable icon

      L.DomEvent.on(icon, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
           
        this.clearPreviousPoint();  // Clear existing center marker (if any)
        this.getUserLocation(); // Call your existing getUserLocation method
      });

      return div;
    };
    myLocationButton.addTo(this.map);
  }


  getUserLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const latLog = {
            lat,
            lng: lon
          }
          this.selectedCenter = latLog;
          this.showPositionOnMap(lat, lon);
          this.fetchNearbyGardens(lat, lon); 

          this.templatlong = latLog;
          //temp
          // const gardens: any = this.gardenService.getAllGardens().then((res: any)=> {
          //   this.nearbyGardens = res;
          //   this.showGardensOnMap(res);
          // })
        

        },
        (error) => {
          console.error('Error getting location', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');   

    }
  }

  showPositionOnMap(lat: number, lon: number): void {
    // Set the map view to the user's location
    this.map.setView([lat, lon], 13);

    // Add a marker to the user's location
    L.marker([lat, lon]).addTo(this.map)
      .bindPopup('You are here!')
      .openPopup();

      this.updateRadiusCircle(lat, lon, this.filter.distance);

  }

  openUploadGardenPage() {
    this.router.navigate(['/garden/upload-garden']);
  }

  logout() {
    this.authService.logout();   
  }


  updateRadiusCircle(lat: number, lng: number, radiusInKm: number) {
    // Remove the existing radius circle if it exists
    if (this.radiusCircle) {
      this.map.removeLayer(this.radiusCircle);
    }

    // Add a new radius circle based on the filter distance
    this.radiusCircle = L.circle([lat, lng], {
      color: 'blue',
      fillColor: '#3388ff',
      fillOpacity: 0.1,
      radius: radiusInKm * 1000 // Convert kilometers to meters
    }).addTo(this.map);
  }

  showGardensOnMap(gardens: any[]) {
    // ... (Clear existing garden markers logic remains the same)
  
    for (const garden of gardens) {
      const iconUrl = garden.images && garden.images.length > 0 ? garden.images[0] : 'assets/default-garden-icon.png';
  
      // Create a custom icon with the garden image inside a circle with a blue border
      const gardenIcon = L.divIcon({
        className: 'custom-garden-icon', // Add a class for styling
        html: `
          <div class="rounded-full border-4 border-blue-500 overflow-hidden" style="width: 40px; height: 40px;">
            <img src="${iconUrl}" alt="Garden Image" class="w-full h-full object-cover">
          </div>
        `
      });
  
      // L.marker([garden.latitude, garden.longitude], { icon: gardenIcon }).addTo(this.map)
      //   .bindPopup(`
      //     <h3>${garden.name}</h3>
      //     <p>${garden.sqft} Sqft</p>

      //     <p>Created by: ${garden.username}</p>

      //   `);
      const marker = L.marker([garden.latitude, garden.longitude], { icon: gardenIcon }).addTo(this.map);
      marker.on('click', () => {
        this.showModal = true;
        this.garden = garden; // Set the selected garden data to display in the modal
      });


    }
  }

  fetchNearbyGardens(lat: number, lon: number): Promise<void> { // Return a Promise<void>
    return this.gardenService.getNearbyGardens(lat, lon, this.filter.distance)
      .then(({ matchingDocs, bounds }) => {
        this.nearbyGardens = matchingDocs;
        console.log('garden', this.nearbyGardens);
        this.showGardensOnMap(matchingDocs); 

        // this.drawGeohashBoundsOnMap(bounds);
      })
      .catch(error => {
        console.error('Error fetching nearby gardens:', error);
      });
  }

  applyFilters() {
    const center = this.selectedCenter || this.map.getCenter();
    console.log('this.map.getCenter();',this.map.getCenter());

    console.log('this.selectedCenter',this.selectedCenter);
    console.log('filter', this.filter);

    console.log('center',center);
    if (!center) {
      console.log('center is not there');
      return;      
    }
    this.fetchNearbyGardens(center.lat, center.lng)
      .then(async () => { 
        await this.filterNearbyGardens(); // Await the filtering
        this.showGardensOnMap(this.nearbyGardens); 
        this.updateRadiusCircle(center.lat, center.lng, this.filter.distance);
      });
  }

  filterNearbyGardens() {
    this.nearbyGardens = this.nearbyGardens.filter(garden => {
      const matchesCategory = 
        this.filter.category === '' ||  // Consider empty category as "All"
        garden.type === this.filter.category;
      const matchesSqft = 
        (this.filter.minSqft === 0 || garden.sqft >= this.filter.minSqft) &&
        (this.filter.maxSqft === 0 || garden.sqft <= this.filter.maxSqft);
  
      return matchesCategory && matchesSqft;
    });

    this.clearGardenMarkers()
  }

  clearGardenMarkers() {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer !== this.userMarker) { // Exclude the user's marker
        this.map.removeLayer(layer);
      }
    });
    console.log('this.templatlong', this.templatlong);
    
    this.setSelectedCenter(this.templatlong);
  }

  setSelectedCenter(latlng: L.LatLng) {
    console.log('latlng', latlng);
    
    this.selectedCenter = latlng;

    // Clear existing center marker (if any)
    this.clearPreviousPoint();

    // Add a marker at the new center
    L.marker(latlng).addTo(this.map)
      .bindPopup('Selected Center')
      .openPopup();

      this.templatlong = latlng
      console.log('this.templatlong', this.templatlong);
    
  }

  clearPreviousPoint() {
    this.map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer !== this.userMarker) {
        this.map.removeLayer(layer);
      }
    });
  }

  getGardens(lat: any, lon: any) {

 
  
    // const center = new GeoPoint(lat, lon); // Hyderabad coordinates
    // const radiusInKm = 10;

    // const query: GeoQuery = this.geoCollection.near({ center, radius: radiusInKm });

    // query.get().then((value: GeoQuerySnapshot) => {
    //   console.log(value.docs); // Array of documents within 10km of Hyderabad
    // });
  }

  drawGeohashBoundsOnMap(bounds: any[]): void {
    bounds.forEach((bound) => {
      const geohashStart = bound[0];
      const geohashEnd = bound[1];

      // Decode the geohashes using the Geohash library
      const boundsStart = Geohash.bounds(geohashStart);
      const boundsEnd = Geohash.bounds(geohashEnd);

      // Define the rectangle's corners using the decoded bounds
      const boundsCorners: any = [
        [boundsStart.sw.lat, boundsStart.sw.lon],
        [boundsStart.sw.lat, boundsEnd.ne.lon],
        [boundsEnd.ne.lat, boundsEnd.ne.lon],
        [boundsEnd.ne.lat, boundsStart.sw.lon]
      ];

      console.log('Drawing geohash rectangle:', boundsCorners);

      // Draw the rectangle on the map using Leaflet
      L.rectangle(boundsCorners, {
        color: '#FF0000',
        weight: 2,
        opacity: 0.8,
        fillColor: '#FF0000',
        fillOpacity: 0.35
      }).addTo(this.map);
    });
  }


  closeModal() {
    this.showModal = false;
  }

  copyGardenUrl() {
    // Your logic to copy the garden URL
  }

  // ... (rest of your dashboard component code)
}

