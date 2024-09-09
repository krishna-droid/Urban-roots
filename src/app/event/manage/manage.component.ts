import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { EventService } from '../event.service';
import { AuthService } from '../../auth.service';

import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { InterestedUsersDialogComponent } from '../interested-users-dialog/interested-users-dialog.component';

import   
 { MAT_DIALOG_DATA,
MatDialog, 
MatDialogModule} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-manage',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule,MatButtonModule, MatDialogModule],
  templateUrl: './manage.component.html',
  styleUrl: './manage.component.css'
})
export class ManageComponent implements OnInit {
  myEvents: any[] = [];
  interestedUsernames: any;
  showModal = false; // To control the modal's visibility

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private dialog: MatDialog // Inject MatDialog
  ) {}

  ngOnInit() {
    this.fetchMyEvents();
  }

  async fetchMyEvents() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.myEvents = await this.eventService.getEventsCreatedByUser(userId);
    } else {
      console.error('User not authenticated. Cannot fetch events.');
    }
  }

  deleteEvent(eventId: string) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId)
        .then(() => {
          this.myEvents = this.myEvents.filter(e => e.id !== eventId);
        })
        .catch(error => {
          console.error('Error deleting event:', error);
          // Handle the error appropriately
        });
    }
  }

  showInterestedUsers(event: any) {
    this.authService.getUsernamesFromUids(event.interestedMembers)
      .then(usernames => {
        this.interestedUsernames = usernames; 
        this.showModal = true; // Open the modal

        // this.dialog.open(InterestedUsersDialogComponent, {
        //   data: { usernames },
          
        // });
      })
      .catch(error => {
        console.error('Error fetching usernames:', error);
        // Handle the error appropriately
      });
  }

  closeModal() {
    this.showModal = false; // Close the modal
    this.interestedUsernames = []; // Clear the usernames array
  }
}
