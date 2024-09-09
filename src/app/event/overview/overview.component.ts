import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { EventService } from '../event.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink,RouterModule]
})
export class EventOverviewComponent implements OnInit {
  events: any[] = [];
  open = false;
  constructor(private authService: AuthService, private eventService: EventService) { }

  ngOnInit(): void {
    this.fetchEvents();
  }

  async fetchEvents() {
    this.events = await this.eventService.getAllEvents();
  }

  isInterested(event: any): boolean {
    const userId = this.authService.getUserId();
 
    return event.interestedMembers && event.interestedMembers.includes(userId);
  }

  toggleInterest(event: any) {
    const userId = this.authService.getUserId();
    if (!userId) {
      // Handle unauthenticated user (e.g., show a login prompt)
      return;
    }

    this.eventService.toggleUserInterest(event.id, userId)
      .then(() => {
        // Update the event's interestedMembers array locally
        if (event.interestedMembers && event.interestedMembers.includes(userId)) {
          event.interestedMembers = event.interestedMembers.filter((id: string) => id !== userId);
        } else {
          event.interestedMembers = [...(event.interestedMembers || []), userId];
        }
      })
      .catch((error: any) => {
        console.error('Error toggling interest:', error);
        // Handle the error appropriately
      });
  }

  logout() {
    this.authService.logout();  
  }

}
