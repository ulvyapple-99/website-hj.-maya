
import { Component, inject } from '@angular/core';
import { HeroComponent } from './hero.component';
import { AssistantComponent } from './assistant.component';
import { AboutComponent } from './about.component';
import { MenuComponent } from './menu.component';
import { LocationComponent } from './location.component';
import { GalleryComponent } from './gallery.component';
import { TestimonialsComponent } from './testimonials.component';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent, 
    AboutComponent,
    MenuComponent,
    LocationComponent,
    AssistantComponent,
    GalleryComponent,
    TestimonialsComponent
  ],
  template: `
    @if (config().features.showHero) { <app-hero></app-hero> }
    @if (config().features.showAbout) { <app-about></app-about> }
    @if (config().features.showMenu) { <app-menu></app-menu> }
    @if (config().features.showTestimonials) { <app-testimonials></app-testimonials> }
    @if (config().features.showGallery) { <app-gallery></app-gallery> }
    @if (config().features.showLocation) { <app-location></app-location> }
    <app-assistant></app-assistant>
  `
})
export class HomeComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
}
