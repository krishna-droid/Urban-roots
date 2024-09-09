import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-interested-users-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interested-users-dialog.component.html',
  styleUrl: './interested-users-dialog.component.css'
})
export class InterestedUsersDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<InterestedUsersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { usernames: string[] }
  ) {}
}
