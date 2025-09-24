import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { JobsPortalComponent } from './components/jobs-portal/jobs-portal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, JobsPortalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('jobs-portal');
}
