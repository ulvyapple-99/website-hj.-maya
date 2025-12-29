
import { Component, inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="py-12 border-t transition-colors duration-500"
      [style.backgroundColor]="config().footer.style.backgroundColor"
      [style.color]="config().footer.style.textColor"
      [style.borderColor]="config().footer.style.textColor + '20'"
      [style.fontFamily]="config().footer.style.fontFamily"
    >
      <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-8">
        
        <!-- Brand -->
        <div class="md:w-1/3">
          <h3 class="font-bold text-2xl mb-2">{{ config().global.logoText }}</h3>
          <p class="text-sm opacity-70 leading-relaxed">
            Menyajikan cita rasa Sate Maranggi asli Cimahi sejak 1980. Bumbu meresap, daging empuk, sambal nikmat.
          </p>
        </div>

        <!-- Links -->
        <div class="flex flex-col gap-2 font-medium">
           <a [href]="config().footer.instagramLink" target="_blank" class="hover:opacity-80 transition flex items-center justify-center md:justify-start gap-2" [style.color]="config().footer.style.accentColor">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Instagram Resmi
           </a>
           @if (config().branches[0]) {
             <a [href]="'https://wa.me/' + configService.formatPhoneNumber(config().branches[0].whatsappNumber)" target="_blank" class="hover:opacity-80 transition flex items-center justify-center md:justify-start gap-2" [style.color]="config().footer.style.accentColor">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Hubungi WhatsApp
             </a>
           }
        </div>

      </div>
      
      <div class="text-center mt-10 pt-6 border-t border-white/10 text-xs opacity-50">
          &copy; {{ year }} {{ config().global.logoText }}. All Rights Reserved.
      </div>
    </footer>
  `
})
export class FooterComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  year = new Date().getFullYear();
}
