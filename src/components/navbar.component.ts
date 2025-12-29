
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav 
      class="sticky top-0 z-50 backdrop-blur-sm shadow-md transition-colors duration-300"
      [style.backgroundColor]="config().global.navbarColor"
      [style.color]="config().global.navbarTextColor"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <!-- Logo -->
          <div routerLink="/" class="flex-shrink-0 flex items-center gap-2 cursor-pointer">
             @if (config().global.logoImage) {
               @if (isVideo(config().global.logoImage)) {
                  <video [src]="config().global.logoImage" class="h-10 w-auto object-contain" autoplay muted loop></video>
               } @else {
                  <img [src]="config().global.logoImage" class="h-10 w-auto object-contain" alt="Logo">
               }
             } @else {
               <div 
                 class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg"
                 [style.backgroundColor]="config().global.navbarTextColor"
                 [style.color]="config().global.navbarColor"
               >
                 {{ config().global.logoText.charAt(0) }}
               </div>
             }
             <span class="font-bold text-xl tracking-wide">{{ config().global.logoText }}</span>
          </div>

          <!-- Desktop Menu -->
          <div class="hidden md:flex space-x-8">
            <a routerLink="/" routerLinkActive="font-bold underline" [routerLinkActiveOptions]="{exact: true}" class="hover:opacity-80 transition-colors font-medium cursor-pointer">Beranda</a>
            <a routerLink="/about" routerLinkActive="font-bold underline" class="hover:opacity-80 transition-colors font-medium cursor-pointer">Tentang</a>
            <a routerLink="/menu" routerLinkActive="font-bold underline" class="hover:opacity-80 transition-colors font-medium cursor-pointer">Menu</a>
            <a routerLink="/reservation" routerLinkActive="font-bold underline" class="hover:opacity-80 transition-colors font-medium cursor-pointer">Reservasi</a>
            <a routerLink="/location" routerLinkActive="font-bold underline" class="hover:opacity-80 transition-colors font-medium cursor-pointer">Lokasi</a>
          </div>

          <!-- Mobile Button -->
          <div class="md:hidden flex items-center">
            <button (click)="toggleMenu()" class="focus:outline-none" [style.color]="config().global.navbarTextColor">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                @if (!isOpen()) {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                } @else {
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (isOpen()) {
        <div class="md:hidden border-t" [style.backgroundColor]="config().global.navbarColor">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a routerLink="/" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium hover:opacity-80">Beranda</a>
            <a routerLink="/about" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium hover:opacity-80">Tentang</a>
            <a routerLink="/menu" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium hover:opacity-80">Menu</a>
            <a routerLink="/reservation" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium hover:opacity-80">Reservasi</a>
            <a routerLink="/location" (click)="closeMenu()" class="block px-3 py-2 rounded-md text-base font-medium hover:opacity-80">Lokasi</a>
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  isOpen = signal(false);

  toggleMenu() {
    this.isOpen.update(v => !v);
  }
  
  closeMenu() {
    this.isOpen.set(false);
  }

  isVideo(url: string) {
    return this.configService.isVideo(url);
  }
}
