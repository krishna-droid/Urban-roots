import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { EventService } from '../event.service';
import * as L from 'leaflet';

// Import Swiper and modules
import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar, A11y } from 'swiper/modules';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth.service';


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EventDetailsComponent implements OnInit{
  event: any | null = null;
  map: L.Map | undefined; // Make map optional

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    L.Icon.Default.imagePath = 'assets/';

    this.route.paramMap.subscribe(params => {
      const eventId = params.get('id');
      if (eventId) {
        this.fetchEventDetails(eventId);
      }
    });
  }



  async fetchEventDetails(eventId: string) {
    try {
      this.event = await this.eventService.getEventById(eventId);

      if (this.event && this.event.eventType === 'offline' && this.event.location) {
        setTimeout(() => { // Add a slight delay
          this.initializeMap();
  
        }, 0); 
      }

    } catch (error) {
      console.error('Error fetching event details:', error);
      // Handle the error appropriately (e.g., show an error message, navigate back)
    }
  }

  private initializeMap() {
    if (!this.event || !this.event.location) return; 

    this.map = L.map('map', {
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      scrollWheelZoom: false,
      boxZoom: false,
      keyboard: false,
      zoomControl: false
    }).setView([this.event.location.latitude, this.event.location.longitude], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([this.event.location.latitude,   
 this.event.location.longitude]).addTo(this.map);
  }

  private initializeImageSlider() {
    setTimeout(() => {
      const swiperContainer = document.querySelector('.mySwiper') as HTMLElement | null;
      if (swiperContainer) {
        new Swiper(swiperContainer, {
          modules: [Navigation, Pagination, Scrollbar, A11y],
          spaceBetween: 10,
          slidesPerView: 1, 
          navigation: true,
          pagination: { clickable: true },
          scrollbar: { draggable:   
 true },
        });
      } else {
        console.error('Swiper container not found.');
      }
    }, 0);
  }

  copyEventUrl() {
    if (this.event && this.event.id) {
      const url = `your-app-base-url/event/${this.event.id}`; 
      navigator.clipboard.writeText(url)
        .then(() => {
          alert('Event URL copied to clipboard!');
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    }
  }

  isInterested(): boolean {
    const userId = this.authService.getUserId();
    return this.event && this.event.interestedMembers && this.event.interestedMembers.includes(userId);
  }

  toggleInterest() {
    if (!this.event || !this.event.id) return; // Check if event is loaded

    const userId = this.authService.getUserId();
    if (!userId) {
      // Handle unauthenticated user (e.g., show a login prompt)
      return;
    }

    this.eventService.toggleUserInterest(this.event.id, userId)
      .then(() => {
        // Update the event's interestedMembers array locally
        if (this.event.interestedMembers && this.event.interestedMembers.includes(userId)) {
          this.event.interestedMembers = this.event.interestedMembers.filter((id: string) => id !== userId);
        } else {
          this.event.interestedMembers = [...(this.event.interestedMembers || []), userId];
        }
      })
      .catch(error => {
        console.error('Error toggling interest:', error);
        // Handle the error appropriately
      });
  }

}