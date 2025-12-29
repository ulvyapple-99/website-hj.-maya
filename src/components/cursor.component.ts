
import { Component, signal, HostListener } from '@angular/core';

@Component({
  selector: 'app-cursor',
  standalone: true,
  template: `
    <div 
      class="fixed pointer-events-none z-[9999] top-0 left-0 transition-transform duration-[50ms] ease-out will-change-transform"
      [style.transform]="'translate3d(' + x() + 'px, ' + y() + 'px, 0)'"
    >
      <!-- The Satay Icon Container -->
      <div class="relative -mt-1 -ml-1 w-16 h-16 animate-slither origin-center">
        <!-- Smoke Effect -->
        <div class="absolute -top-4 right-2 opacity-50 animate-steam">
           <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
             <path d="M5 10C5 10 2 7 2 5C2 3.34315 3.34315 2 5 2C6.65685 2 8 3.34315 8 5C8 7 5 10 5 10Z" fill="#ddd"/>
           </svg>
        </div>

        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-lg filter">
          <!-- Stick -->
          <path d="M10 90 L90 10" stroke="#8D6E63" stroke-width="6" stroke-linecap="round" />
          
          <!-- Meat 1 (Bottom) -->
          <rect x="25" y="60" width="20" height="20" rx="6" fill="#5D4037" transform="rotate(-45 35 70)" />
          <path d="M25 65 L45 65" stroke="#3E2723" stroke-width="2" transform="rotate(-45 35 70)" opacity="0.5"/>
          
          <!-- Meat 2 (Middle) -->
          <rect x="40" y="45" width="22" height="22" rx="7" fill="#6D4C41" transform="rotate(-45 51 56)" />
          <circle cx="51" cy="56" r="3" fill="#3E2723" opacity="0.3"/>

          <!-- Meat 3 (Top) -->
          <rect x="55" y="30" width="20" height="20" rx="6" fill="#5D4037" transform="rotate(-45 65 40)" />
          <path d="M58 35 L70 45" stroke="#3E2723" stroke-width="2" transform="rotate(-45 65 40)" opacity="0.5"/>

          <!-- Char marks -->
          <circle cx="35" cy="70" r="2" fill="#212121"/>
          <circle cx="65" cy="40" r="2" fill="#212121"/>
        </svg>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slither {
      0% { transform: rotate(0deg) scale(1) skewX(0deg); }
      25% { transform: rotate(-15deg) scale(1.1) skewX(-10deg); }
      50% { transform: rotate(0deg) scale(1) skewX(0deg); }
      75% { transform: rotate(15deg) scale(1.1) skewX(10deg); }
      100% { transform: rotate(0deg) scale(1) skewX(0deg); }
    }
    @keyframes steam {
      0% { transform: translateY(0) scale(1); opacity: 0.5; }
      100% { transform: translateY(-15px) scale(1.8); opacity: 0; }
    }
    .animate-slither {
      animation: slither 1.5s infinite ease-in-out;
    }
    .animate-steam {
      animation: steam 1s infinite ease-out;
    }
  `]
})
export class CursorComponent {
  x = signal(-100);
  y = signal(-100);

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.x.set(e.clientX);
    this.y.set(e.clientY);
  }
}
