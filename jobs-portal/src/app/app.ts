import { Component, signal } from '@angular/core';
import { JobsPortalComponent } from './components/jobs-portal/jobs-portal';

@Component({
  selector: 'app-root',
  imports: [JobsPortalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('jobs-portal');
}
