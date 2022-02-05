
/*
 * Magic Cloud, copyright Aista, Ltd. See the attached LICENSE file for details.
 */

// Angular and system imports.
import { Component } from '@angular/core';
import { AuthService } from '../management/auth/services/auth.service';

/**
 * Diagnostics component to display meta information related to the system's health, such
 * as number of log items, failed login attempts, etc.
 */
@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent {

  /**
   * Creates an instance of your component
   * 
   * @param authService Needed to verify if user has access to components
   */
  constructor(public authService: AuthService) {
  }
}
