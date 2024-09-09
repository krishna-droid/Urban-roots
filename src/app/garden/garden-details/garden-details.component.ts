import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { GardenService } from '../garden.service';
import * as L from 'leaflet';

// Import Swiper (you'll need to install it)
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-garden-details',
  templateUrl: './garden-details.component.html',
  styleUrls: ['./garden-details.component.css'],
  standalone:true,
  imports: [CommonModule,FormsModule, RouterLink,RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

})
export class GardenDetailsComponent implements OnInit {
  garden: any | null = null;
  map: any;


  constructor(
    private route: ActivatedRoute,
    private gardenService: GardenService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const gardenId = params.get('id');
      if (gardenId) {
        this.fetchGardenDetails(gardenId);
      }
    });

       // setTimeout((v:any)=> {
        //     this.autoSlide();
        // }, 3000);
  }

  ngAfterViewInit() {
    // Initialize the map and the image slider here (after the view is initialized)
    if (this.garden && this.garden.location) {
      this.initializeMap();
      this.initializeImageSlider();
    }
  }

  async fetchGardenDetails(gardenId: string) {
    try {
      this.garden = await this.gardenService.getGardenById(gardenId);

      if (!this.map) {
        setTimeout(() => { // Add a slight delay
          this.initializeMap();
          this.initializeImageSlider();

        }, 0); // 0 milliseconds is enough to trigger a re-render
      }
      // this.initializeImageSlider();
    } catch (error) {
      console.error('Error fetching garden details:', error);
      // Handle the error appropriately (e.g., show an error message, navigate back)
    }
  }

  private initializeMap() {
    if (!this.garden || !this.garden.location) return; // Check if garden and location are available

    this.map = L.map('map', { // Make the map non-interactive (not draggable or zoomable)
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false
    }).setView([this.garden.location.latitude, this.garden.location.longitude], 15); // Adjust zoom as needed

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Add a marker for the garden location with the first image as the icon
    const iconUrl = this.garden.images && this.garden.images.length > 0 
      ? this.garden.images[0] 
      : 'path/to/default-garden-icon.png'; // Replace with your default icon path

      const gardenIcon = L.divIcon({
        className: 'custom-garden-icon', // Add a class for styling
        html: `
          <div class="rounded-full border-4 border-green-500 overflow-hidden" style="width: 40px; height: 40px;">
            <img src="${iconUrl}" alt="Garden Image" class="w-full h-full object-cover">
          </div>
        `
      });

         L.marker([this.garden.latitude, this.garden.longitude], { icon: gardenIcon }).addTo(this.map)

  }

  private initializeImageSlider() {
    setTimeout(() => {
      const swiperContainer = document.querySelector('.mySwiper') as HTMLElement | null; // Type assertion
      if (swiperContainer) {
        new Swiper(swiperContainer, {
          modules: [Navigation, Pagination, Scrollbar, A11y],
          spaceBetween: 10,
          slidesPerView: 1, 
          navigation: true,
          pagination: { clickable: true },
          scrollbar: { draggable: true },        
        });
      } else {
        console.error('Swiper container not found. Make sure the images have been loaded.');
      }
    }, 0);
  }

  copyGardenUrl() {
    if (this.garden && this.garden.id) {
      const url = `your-app-base-url/garden/${this.garden.id}`; // Replace with your actual app base URL
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('Garden URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    }
  }
}