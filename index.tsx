
import '@angular/compiler';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, Routes } from '@angular/router';

// Component Imports for Routes
import { HomeComponent } from './src/components/home.component';
import { AboutComponent } from './src/components/about.component';
import { MenuComponent } from './src/components/menu.component';
import { PackagesComponent } from './src/components/packages.component';
import { LocationComponent } from './src/components/location.component';
import { ReservationComponent } from './src/components/reservation.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'packages', component: PackagesComponent },
  { path: 'reservation', component: ReservationComponent },
  { path: 'location', component: LocationComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
