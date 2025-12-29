
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="pt-24 pb-16 min-h-screen transition-colors duration-500"
      [style.backgroundColor]="config().locationPage.style.backgroundColor"
      [style.color]="config().locationPage.style.textColor"
      [style.fontFamily]="config().locationPage.style.fontFamily"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-10">
          <span class="font-bold tracking-widest uppercase text-xs mb-2 block" [style.color]="config().locationPage.style.accentColor">Temukan Kami</span>
          <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ config().locationPage.title }}</h2>
          <p class="opacity-70 max-w-2xl mx-auto">
            {{ config().locationPage.subtitle }}
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (branch of config().branches; track $index) {
            <div class="p-6 rounded-2xl border hover:bg-white/5 transition group flex flex-col h-full"
                 [style.borderColor]="config().locationPage.style.textColor + '20'">
              <h4 class="text-xl font-bold mb-4" [style.color]="config().locationPage.style.accentColor">{{ branch.name }}</h4>
              
              <div class="space-y-4 text-sm opacity-90 mb-6 flex-grow">
                <div class="flex items-start gap-3">
                   <span class="font-bold text-lg">📍</span>
                   <span class="pt-1">{{ branch.address }}</span>
                </div>
                <div class="flex items-center gap-3">
                   <span class="font-bold text-lg">📞</span>
                   <span>{{ branch.phone }}</span>
                </div>
                <div class="flex items-center gap-3">
                   <span class="font-bold text-lg">⏰</span>
                   <span>{{ branch.hours }}</span>
                </div>
              </div>

              <!-- Maps Visual -->
              <div class="h-48 rounded-xl overflow-hidden relative shadow-inner bg-gray-800">
                @if (is3D(branch.mapImage)) {
                  <model-viewer 
                    [src]="branch.mapImage" 
                    auto-rotate 
                    camera-controls
                    class="w-full h-full">
                  </model-viewer>
                } @else {
                  <img [src]="branch.mapImage" alt="Map" class="w-full h-full object-cover opacity-80 hover:scale-110 transition duration-500">
                }
                
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <a [href]="branch.googleMapsUrl" target="_blank" 
                     class="text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto"
                     [style.backgroundColor]="config().locationPage.style.accentColor">
                    Buka Google Maps
                  </a>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class LocationComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  is3D(url: string) { return this.configService.is3D(url); }
}
