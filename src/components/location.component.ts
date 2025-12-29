
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <section class="pt-24 pb-16 bg-brand-brown text-brand-cream min-h-screen">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-10">
          <span class="text-brand-orange font-bold tracking-widest uppercase text-xs mb-2 block">Temukan Kami</span>
          <h2 class="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Lokasi Cabang</h2>
          <p class="text-white/70 max-w-2xl mx-auto">
            Nikmati kelezatan Sate Maranggi Hj. Maya di cabang terdekat Anda. Kami hadir di 3 lokasi strategis di Bandung Raya.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          @for (branch of config().branches; track $index) {
            <div class="bg-white/5 p-6 rounded-2xl border border-white/10 hover:bg-white/10 transition group flex flex-col h-full">
              <h4 class="text-xl font-bold text-brand-orange mb-4">{{ branch.name }}</h4>
              
              <div class="space-y-4 text-sm opacity-90 mb-6 flex-grow">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0 text-brand-gold">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span class="pt-1">{{ branch.address }}</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0 text-brand-gold">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <span>{{ branch.phone }}</span>
                </div>
                <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-full bg-brand-orange/20 flex items-center justify-center flex-shrink-0 text-brand-gold">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <span>{{ branch.hours }}</span>
                </div>
              </div>

              <!-- Maps Visual (Image or 3D) -->
              <div class="h-48 bg-gray-700 rounded-xl overflow-hidden relative shadow-inner">
                @if (is3D(branch.mapImage)) {
                  <model-viewer 
                    [src]="branch.mapImage" 
                    auto-rotate 
                    camera-controls
                    interaction-prompt="none"
                    class="w-full h-full bg-gray-600">
                  </model-viewer>
                } @else {
                  <img [src]="branch.mapImage" alt="Map Location" class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition duration-500 hover:scale-110">
                }
                
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <a [href]="branch.googleMapsUrl" target="_blank" class="bg-brand-orange text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition transform hover:scale-105 shadow-lg flex items-center gap-2 pointer-events-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
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

  is3D(url: string) {
    return this.configService.is3D(url);
  }
}
