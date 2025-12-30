
import { Component, inject, HostListener, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConfigService } from '../services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <section 
      class="relative overflow-hidden min-h-[95vh] flex items-center justify-center transition-colors duration-500"
      [style.backgroundColor]="config().hero.style.backgroundColor"
      [style.color]="config().hero.style.textColor"
      [style.fontFamily]="config().hero.style.fontFamily"
    >
      <!-- Background overlay image with Parallax -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 scale-110 will-change-transform" 
             [style.transform]="'translateY(' + scrollY() * 0.5 + 'px)'">
           @if (isVideo(config().hero.bgImage)) {
              <video 
                [src]="config().hero.bgImage" 
                autoplay muted loop playsinline
                class="w-full h-full object-cover"
                [style.opacity]="1 - config().hero.overlayOpacity"
              ></video>
           } @else {
              <img [src]="config().hero.bgImage" alt="Hero Background" class="w-full h-full object-cover" [style.opacity]="1 - config().hero.overlayOpacity">
           }
        </div>
        
        <!-- Gradient Overlay -->
        <div 
          class="absolute inset-0 z-10" 
          [style.background]="'radial-gradient(circle at center, transparent 0%, ' + config().hero.style.backgroundColor + ' 90%)'"
        ></div>
        <!-- Opacity Overlay -->
        <div class="absolute inset-0 bg-black z-10" [style.opacity]="config().hero.overlayOpacity"></div>
      </div>

      <div class="relative z-20 max-w-5xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <!-- Badge -->
        <div class="mb-6 animate-fade-in-down opacity-0" style="animation-delay: 0.1s; animation-fill-mode: forwards;">
           <span class="px-5 py-2 rounded-full text-xs font-bold tracking-[0.25em] uppercase border border-white/40 backdrop-blur-md shadow-lg"
                 [style.color]="config().hero.style.accentColor"
                 [style.borderColor]="config().hero.style.accentColor">
              Est. 1980
           </span>
        </div>

        <h1 class="font-bold tracking-tight mb-6 animate-fade-in-up leading-tight drop-shadow-2xl"
            [style.fontSize]="config().hero.style.titleFontSize">
          {{ config().hero.title }} <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-200"
                [style.backgroundImage]="'linear-gradient(to right, ' + config().hero.style.accentColor + ', #FFD54F)'">
            {{ config().hero.highlight }}
          </span>
        </h1>
        
        <div class="w-24 h-1.5 bg-white/60 mb-8 rounded-full animate-width-grow shadow-lg"></div>

        <p class="max-w-2xl mb-10 font-light animate-fade-in-up opacity-0 text-gray-100 leading-relaxed drop-shadow-md" 
           [style.fontSize]="config().hero.style.subtitleFontSize"
           style="animation-delay: 0.3s; animation-fill-mode: forwards;">
          {{ config().hero.subtitle }}
        </p>
        
        <div class="flex flex-col sm:flex-row gap-5 animate-fade-in-up opacity-0" style="animation-delay: 0.5s; animation-fill-mode: forwards;">
          <a routerLink="/menu" 
             class="font-bold shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all transform hover:scale-105 hover:-translate-y-1 cursor-pointer no-underline border-none text-white relative overflow-hidden group"
             [style.backgroundColor]="config().hero.style.accentColor"
             [style.paddingTop]="config().hero.style.buttonPaddingY"
             [style.paddingBottom]="config().hero.style.buttonPaddingY"
             [style.paddingLeft]="config().hero.style.buttonPaddingX"
             [style.paddingRight]="config().hero.style.buttonPaddingX"
             [style.borderRadius]="config().hero.style.buttonRadius"
          >
            <span class="relative z-10">{{ config().hero.buttonText1 }}</span>
            <div class="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </a>
          <a routerLink="/reservation" 
             class="font-bold transition-all transform hover:scale-105 cursor-pointer no-underline border-2 border-white/30 backdrop-blur-sm hover:bg-white/10 hover:border-white"
             [style.color]="'#fff'"
             [style.paddingTop]="config().hero.style.buttonPaddingY"
             [style.paddingBottom]="config().hero.style.buttonPaddingY"
             [style.paddingLeft]="config().hero.style.buttonPaddingX"
             [style.paddingRight]="config().hero.style.buttonPaddingX"
             [style.borderRadius]="config().hero.style.buttonRadius"
          >
            {{ config().hero.buttonText2 }}
          </a>
        </div>
      </div>
      
      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-60 z-20 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  `,
  styles: [`
    @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fade-in-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes width-grow { from { width: 0; } to { width: 6rem; } }
    
    .animate-fade-in-up { animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-fade-in-down { animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-width-grow { animation: width-grow 1s ease-out forwards; animation-delay: 0.2s; }
  `]
})
export class HeroComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  scrollY = signal(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrollY.set(window.scrollY);
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
