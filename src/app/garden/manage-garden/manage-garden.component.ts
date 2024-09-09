import { Component, OnInit } from '@angular/core';
import { GardenService } from '../garden.service';
import { AuthService } from '../../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-manage-garden',
  templateUrl: './manage-garden.component.html',
  styleUrls: ['./manage-garden.component.css'],
  standalone: true,
  imports :[FormsModule, CommonModule,RouterLink, RouterModule]
})
export class ManageGardenComponent implements OnInit {
  myGardens: any[] = [];

  constructor(
    private gardenService: GardenService, 
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fetchMyGardens();
  }

  async fetchMyGardens() {
    const userId = this.authService.getUserId();
    if (userId) {
      this.myGardens = await this.gardenService.getGardensByUserId(userId);
    } else {
      // Handle the case where the user is not authenticated
      console.error('User not authenticated. Cannot fetch gardens.');
    }
  }

  editGarden(garden: any) {
    // Implement your garden editing logic here (e.g., navigate to an edit page or open a modal)
    console.log('Edit garden:', garden);
  }

  deleteGarden(gardenId: string) {
    if (confirm('Are you sure you want to delete this garden?')) {
      this.gardenService.deleteGarden(gardenId)
        .then(() => {
          // Remove the garden from the myGardens array
          this.myGardens = this.myGardens.filter(g => g.id !== gardenId);
        })
        .catch(error => {
          console.error('Error deleting garden:', error);
          // Handle the error appropriately (e.g., show an error message to the user)
        });
    }
  }
  

}
