import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private snackBar: MatSnackBar) {}

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['success-snackbar'],
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      panelClass: ['error-snackbar'],
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
