import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl w-full mx-auto">
        <div class="grid md:grid-cols-2 gap-8 items-stretch">
          
          <!-- Card 1: Attendance -->
          <div class="w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
            <div>
              <svg class="mx-auto h-12 w-auto text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 class="mt-6 text-2xl font-extrabold text-gray-900 font-serif">
                {{ config().attendancePage.title }}
              </h2>
              <p class="mt-2 text-sm text-gray-600">
                {{ config().attendancePage.subtitle }}
              </p>
            </div>
            <div class="mt-8 flex-grow flex flex-col justify-end">
              <a [href]="config().attendancePage.url" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors shadow-md hover:shadow-lg">
                <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg class="h-5 w-5 text-orange-500 group-hover:text-orange-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                </span>
                {{ config().attendancePage.buttonText }}
              </a>
              <p class="mt-4 text-xs text-gray-500">
                {{ config().attendancePage.note }}
              </p>
            </div>
          </div>

          <!-- Card 2: Job Application -->
          @if(config().jobApplication.enabled) {
            <div class="w-full space-y-8 text-center bg-white p-10 rounded-2xl shadow-lg border border-gray-200 flex flex-col">
              <div>
                <svg class="mx-auto h-12 w-auto text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <h2 class="mt-6 text-2xl font-extrabold text-gray-900 font-serif">
                  {{ config().jobApplication.title }}
                </h2>
                <p class="mt-2 text-sm text-gray-600">
                  {{ config().jobApplication.subtitle }}
                </p>
              </div>
              <div class="mt-8 flex-grow flex flex-col justify-end">
                <a [href]="mailtoHref()" 
                   target="_blank" 
                   rel="noopener noreferrer"
                   class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-md hover:shadow-lg">
                  <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-300 group-hover:text-blue-200" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                       <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                     </svg>
                  </span>
                  {{ config().jobApplication.buttonText }}
                </a>
              </div>
            </div>
          }

        </div>
      </div>
    </section>
  `
})
export class AttendanceComponent {
  configService = inject(ConfigService);
  config = this.configService.config;

  mailtoHref = computed(() => {
    const jobConfig = this.config().jobApplication;
    const email = jobConfig.email;
    const subject = encodeURIComponent(jobConfig.emailSubject);
    const body = encodeURIComponent(jobConfig.emailBody);
    return `mailto:${email}?subject=${subject}&body=${body}`;
  });
}
