
import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="about" class="relative py-20 bg-white overflow-hidden">
      <!-- Background Ornament -->
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-cream rounded-full blur-3xl opacity-50 z-0"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-brand-orange/10 rounded-full blur-2xl z-0"></div>

      <div class="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          
          <!-- Image Section -->
          <div class="relative order-2 md:order-1 animate-fade-in-left">
             <!-- Border Frame -->
             <div class="absolute top-4 left-4 w-full h-full border-2 border-brand-orange rounded-2xl z-0 transform translate-x-2 translate-y-2"></div>
             
             <!-- Main Image Container -->
             <div class="relative rounded-2xl overflow-hidden shadow-2xl h-[450px] bg-gray-200 z-10">
                @if (hasImage()) {
                   @if (isVideo(config().about.image)) {
                     <video [src]="config().about.image" autoplay muted loop playsinline class="w-full h-full object-cover"></video>
                   } @else {
                     <img [src]="config().about.image" alt="Tentang Sate Maranggi Hj. Maya" class="w-full h-full object-cover hover:scale-105 transition duration-700">
                   }
                } @else {
                   <!-- Fallback if no image -->
                   <div class="w-full h-full flex items-center justify-center bg-brand-brown text-white">
                      <span class="text-4xl font-serif">{{ config().branding.logoText.charAt(0) }}</span>
                   </div>
                }
                
                <!-- Quote Overlay -->
                <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                   <div class="border-l-4 border-brand-orange pl-4">
                     <p class="text-white italic text-lg font-serif">"{{ config().branding.logoText }}"</p>
                     <p class="text-brand-cream text-sm mt-1">Sejak 2005</p>
                   </div>
                </div>
             </div>
          </div>

          <!-- Content Section -->
          <div class="order-1 md:order-2 animate-fade-in-right">
            <!-- Dynamic Logo/Badge -->
            <div class="mb-6 inline-block">
              <span class="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-bold tracking-widest uppercase rounded-full mb-2 inline-block">
                Tentang Kami
              </span>
            </div>
            
            <h2 class="text-4xl md:text-5xl font-serif font-bold text-brand-brown mb-6 leading-tight">
              {{ config().about.title }}
            </h2>
            
            <div class="prose text-gray-600 leading-relaxed text-lg mb-8 text-justify">
              <p>{{ config().about.description }}</p>
            </div>

            <!-- Stats / Features -->
            <div class="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
               <div class="text-center group cursor-default">
                  <div class="w-12 h-12 mx-auto bg-brand-cream rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span class="block text-2xl font-bold text-brand-brown">100%</span>
                  <span class="text-xs text-gray-500 uppercase tracking-wide font-bold">Daging Segar</span>
               </div>
               
               <div class="text-center group cursor-default">
                  <div class="w-12 h-12 mx-auto bg-brand-cream rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <span class="block text-2xl font-bold text-brand-brown">4.9</span>
                  <span class="text-xs text-gray-500 uppercase tracking-wide font-bold">Rating Rasa</span>
               </div>

               <div class="text-center group cursor-default">
                  <div class="w-12 h-12 mx-auto bg-brand-cream rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-brand-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span class="block text-2xl font-bold text-brand-brown">3</span>
                  <span class="text-xs text-gray-500 uppercase tracking-wide font-bold">Cabang</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fade-in-left {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fade-in-right {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    .animate-fade-in-left {
      animation: fade-in-left 0.8s ease-out forwards;
    }
    .animate-fade-in-right {
      animation: fade-in-right 0.8s ease-out forwards;
    }
  `]
})
export class AboutComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  // Computed helper to check if image exists safely
  hasImage = computed(() => {
    const img = this.config().about.image;
    return img && img.trim().length > 0;
  });

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
