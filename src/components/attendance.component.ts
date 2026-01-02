
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-200">
        <div>
          <svg class="mx-auto h-12 w-auto text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900 font-serif">
            Portal Absensi Karyawan
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Silakan klik tombol di bawah untuk melanjutkan ke halaman absensi online. Pastikan Anda masuk dengan akun yang terdaftar.
          </p>
        </div>
        <div class="mt-8">
          <a href="https://gen-lang-client-0329168072.web.app/" 
             target="_blank" 
             rel="noopener noreferrer"
             class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-md hover:shadow-lg">
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="h-5 w-5 text-orange-500 group-hover:text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
              </svg>
            </span>
            Buka Halaman Absensi
          </a>
        </div>
        <p class="mt-4 text-xs text-gray-500">
          Jika mengalami kendala, hubungi Manajer Cabang.
        </p>
      </div>
    </section>
  `
})
export class AttendanceComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
}
