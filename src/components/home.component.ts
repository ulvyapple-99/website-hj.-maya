
import { Component } from '@angular/core';
import { HeroComponent } from './hero.component';
import { AssistantComponent } from './assistant.component';
import { AboutComponent } from './about.component';
import { MenuComponent } from './menu.component';
import { LocationComponent } from './location.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent, 
    AboutComponent,
    MenuComponent,
    LocationComponent,
    AssistantComponent
  ],
  template: `
    <app-hero></app-hero>
    <app-about></app-about>
    <app-menu></app-menu>
    <app-location></app-location>
    <app-assistant></app-assistant>
  `
})
export class HomeComponent {}
