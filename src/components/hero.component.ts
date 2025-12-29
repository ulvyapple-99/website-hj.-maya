
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <section 
      class="relative overflow-hidden min-h-[90vh] flex items-center justify-center transition-colors duration-500"
      [style.backgroundColor]="config().hero.style.backgroundColor"
      [style.color]="config().hero.style.textColor"
      [style.fontFamily]="config().hero.style.fontFamily"
    >
      <!-- Background overlay image -->
      <div class="absolute inset-0">
        @if (isVideo(config().hero.bgImage)) {
           <video 
             [src]="config().hero.bgImage" 
             autoplay muted loop playsinline
             class="w-full h-full object-cover opacity-40"
           ></video>
        } @else {
           <img [src]="config().hero.bgImage" alt="Hero Background" class="w-full h-full object-cover opacity-40">
        }
        <!-- Gradient matching bg color -->
        <div 
          class="absolute inset-0" 
          [style.background]="'linear-gradient(to top, ' + config().hero.style.backgroundColor + ', transparent)'"
        ></div>
      </div>

      <div class="relative max-w-6xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 class="text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in-up">
          {{ config().hero.title }} <span [style.color]="config().hero.style.accentColor">{{ config().hero.highlight }}</span>
        </h1>
        <p class="text-lg md:text-xl max-w-2xl mb-8 font-light animate-fade-in-up delay-100 opacity-90">
          {{ config().hero.subtitle }}
        </p>
        <div class="flex gap-4 animate-fade-in-up delay-200">
          <a routerLink="/menu" 
             class="font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:scale-105 cursor-pointer no-underline border-none text-white"
             [style.backgroundColor]="config().hero.style.accentColor"
          >
            Lihat Menu
          </a>
          <a routerLink="/location" 
             class="font-bold py-3 px-8 rounded-full transition cursor-pointer no-underline border-2"
             [style.borderColor]="config().hero.style.textColor"
             [style.color]="config().hero.style.textColor"
          >
            Lokasi
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-fade-in-up { animation: fade-in-up 1s ease-out forwards; }
    .delay-100 { animation-delay: 0.1s; opacity: 0; }
    .delay-200 { animation-delay: 0.2s; opacity: 0; }
  `]
})
export class HeroComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
