
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch, Testimonial, FirebaseConfig } from '../services/config.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Floating Admin Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-900 text-white p-3 rounded-full shadow-none hover:shadow-2xl opacity-5 hover:opacity-100 transition-all duration-500 hover:scale-110 border border-transparent hover:border-gray-500 group"
      title="Admin Panel"
    >
      <!-- Indicator Dot -->
      @if (firestoreError()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-gray-900 animate-ping"></span>
      } @else if (isDemoMode()) {
        <span class="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border border-gray-900"></span>
      }

      <div class="absolute inset-0 rounded-full border border-white/20"></div>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 group-hover:rotate-90 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Global Processing Loading Indicator -->
    @if (isUploading()) {
      <div class="fixed inset-0 z-[100] bg-black/50 backdrop-blur flex items-center justify-center flex-col text-white">
         <svg class="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <p class="font-bold">Memproses & Mengompres Gambar...</p>
      </div>
    }

    <!-- Admin Panel Overlay -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto font-sans">
        <!-- Backdrop -->
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>

        <!-- Sidebar Container -->
        <div class="relative w-full max-w-2xl bg-gray-50 h-full shadow-2xl flex flex-col animate-slide-in border-l border-gray-200">
          
          <!-- Sticky Header -->
          <div class="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-20">
             <div class="flex items-center gap-3">
                @if (currentView() !== 'dashboard' && isAuthenticated()) {
                  <button (click)="currentView.set('dashboard')" class="p-2 hover:bg-gray-100 rounded-full transition text-gray-600 border border-transparent hover:border-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                }
                <div>
                   <h2 class="text-xl font-bold text-gray-900 tracking-tight">{{ getTitle() }}</h2>
                   <p class="text-xs text-gray-500 font-medium flex items-center gap-2">
                     @if(firestoreError()) { 
                       <span class="text-red-500 font-bold">● Error Koneksi</span> 
                     } @else if(isDemoMode()) { 
                       <span class="text-yellow-600 font-bold">● Local Mode (Offline)</span> 
                     } @else { 
                       <span class="text-green-600 font-bold">● Cloud Connected</span> 
                     }
                   </p>
                </div>
             </div>
             
             <div class="flex items-center gap-3">
                @if (isAuthenticated()) {
                  <button (click)="saveChanges()" class="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-md whitespace-nowrap">
                     {{ isDemoMode() ? 'Simpan (Lokal)' : 'Simpan ke Cloud' }}
                  </button>
                  <button (click)="logout()" class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-1.5 rounded hover:bg-red-50 transition border border-transparent hover:border-red-100">
                    Keluar
                  </button>
                }
                <button (click)="togglePanel()" class="text-gray-400 hover:text-gray-900 transition p-2 hover:bg-gray-100 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
             </div>
          </div>

          <!-- Alert Error Database (Only show if not in demo mode fallback) -->
          @if (firestoreError()) {
            <div class="bg-red-50 border-b border-red-200 p-4 animate-fade-in">
              <div class="flex items-start gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
                 <div>
                   <h4 class="text-red-800 font-bold text-sm">Peringatan Cloud</h4>
                   <p class="text-red-600 text-xs mt-1">{{ firestoreError() }}</p>
                 </div>
              </div>
            </div>
          }

          <!-- Content Scroll Area -->
          <div class="flex-1 overflow-y-auto bg-gray-50/50">
            @if (!isAuthenticated()) {
              <!-- Login Form -->
              <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
                <div class="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                  <div class="bg-brand-cream w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  
                  <h2 class="text-2xl font-serif font-bold text-gray-900">Login Admin</h2>
                  
                  @if (isDemoMode()) {
                    <div class="bg-yellow-50 text-yellow-800 p-3 rounded mb-4 text-xs text-left border border-yellow-200">
                       <strong>Mode Demo / Offline:</strong><br>
                       Karena database Cloud tidak terhubung, Anda bisa login dengan akun demo.<br>
                       Email: <code>admin@demo.com</code><br>
                       Password: <code>demo</code>
                    </div>
                  } @else {
                    <p class="text-gray-500 text-sm mt-2 mb-8">Masuk dengan Akun Firebase Anda.</p>
                  }
                  
                  <div class="space-y-4">
                      <!-- Email Input -->
                      <div class="relative group">
                        <input 
                          type="email" 
                          [(ngModel)]="emailInput" 
                          placeholder="Email Admin" 
                          class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition shadow-sm group-hover:border-gray-400"
                        >
                      </div>

                      <!-- Password Input -->
                      <div class="relative group">
                        <input 
                          [type]="showPassword() ? 'text' : 'password'" 
                          [(ngModel)]="passwordInput" 
                          placeholder="Password" 
                          class="w-full bg-white text-gray-900 border border-gray-300 rounded-xl px-4 py-3.5 text-sm pr-10 outline-none focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange transition shadow-sm group-hover:border-gray-400"
                        >
                      </div>

                      <button (click)="login()" [disabled]="isLoggingIn()" class="w-full bg-brand-orange text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50">
                        {{ isLoggingIn() ? 'Memproses...' : 'Masuk Dashboard' }}
                      </button>

                      <div *ngIf="loginError()" class="text-red-500 text-xs font-bold bg-red-50 p-2 rounded">
                        {{ loginError() }}
                      </div>
                      
                      <div class="pt-4 border-t mt-4 text-center">
                         <button (click)="currentView.set('setup')" class="text-xs text-gray-400 hover:text-gray-600 underline">
                            Setup Database Project ID
                         </button>
                      </div>
                  </div>
                </div>
              </div>

            } @else {
              
              <div class="p-6 md:p-8 space-y-8 pb-32">
                <!-- DASHBOARD GRID -->
                @if (currentView() === 'dashboard') {
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in-up">
                    
                    <button (click)="currentView.set('design')" class="md:col-span-2 group relative overflow-hidden bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="relative z-10 flex items-center gap-4">
                          <div class="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-110 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.355m0 0l2.698 2.606a1 1 0 101.414-1.414l-4.242-4.242a1 1 0 00-1.414 0l-4.242 4.242a1 1 0 101.414 1.414L11 7.343z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-lg text-gray-800 group-hover:text-blue-700 transition-colors">Editor Tampilan</h3>
                            <p class="text-sm text-gray-500 mt-1 max-w-sm">Ubah teks, warna, font, gambar background, dan layout halaman utama.</p>
                          </div>
                       </div>
                    </button>

                    <button (click)="currentView.set('menu')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">Manajemen Menu</h3>
                            <p class="text-xs text-gray-500">Edit harga & foto makanan</p>
                          </div>
                       </div>
                    </button>

                    <!-- Setup Button -->
                    <button (click)="currentView.set('setup')" class="group bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all text-left">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center border border-gray-200">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-gray-800">Setup Database</h3>
                            <p class="text-xs text-gray-500">Ganti API Key & Project ID</p>
                          </div>
                       </div>
                    </button>

                    <button (click)="currentView.set('deployment')" class="md:col-span-2 group relative overflow-hidden bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-700 hover:shadow-lg transition-all text-left">
                       <div class="relative z-10 flex items-center gap-4">
                          <div class="w-14 h-14 rounded-full bg-gray-700 text-green-400 flex items-center justify-center border border-gray-600 group-hover:scale-110 transition-transform">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <div>
                            <h3 class="font-bold text-lg text-white group-hover:text-green-400 transition-colors">Status Hosting</h3>
                            <p class="text-sm text-gray-400 mt-1 max-w-sm">
                               {{ isDemoMode() ? 'Menggunakan Local Storage (Offline)' : 'Terhubung ke Firebase Cloud' }}
                            </p>
                          </div>
                       </div>
                    </button>
                  </div>
                }

                <!-- SETUP VIEW -->
                @if (currentView() === 'setup') {
                   <div class="bg-white p-6 rounded-xl shadow-sm border animate-fade-in space-y-6">
                      <div class="border-b pb-4">
                         <h3 class="text-xl font-bold">Konfigurasi Firebase</h3>
                         <p class="text-sm text-gray-500 mt-1">
                           Jika Anda menggunakan Project Firebase sendiri, ganti konfigurasi di bawah ini agar database terhubung ke akun Anda.
                         </p>
                      </div>

                      <div class="space-y-4">
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1">API Key</label>
                            <input type="text" [(ngModel)]="tempConfig.apiKey" class="w-full border rounded p-2 font-mono text-sm bg-gray-50">
                         </div>
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1">Auth Domain</label>
                            <input type="text" [(ngModel)]="tempConfig.authDomain" class="w-full border rounded p-2 font-mono text-sm bg-gray-50">
                         </div>
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1">Project ID</label>
                            <input type="text" [(ngModel)]="tempConfig.projectId" class="w-full border rounded p-2 font-mono text-sm bg-gray-50 font-bold text-blue-600">
                         </div>
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1">Storage Bucket</label>
                            <input type="text" [(ngModel)]="tempConfig.storageBucket" class="w-full border rounded p-2 font-mono text-sm bg-gray-50">
                         </div>
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1">Messaging Sender ID</label>
                            <input type="text" [(ngModel)]="tempConfig.messagingSenderId" class="w-full border rounded p-2 font-mono text-sm bg-gray-50">
                         </div>
                         <div>
                            <label class="block text-xs font-bold text-gray-500 mb-1">App ID</label>
                            <input type="text" [(ngModel)]="tempConfig.appId" class="w-full border rounded p-2 font-mono text-sm bg-gray-50">
                         </div>
                      </div>

                      <div class="flex gap-4 pt-4 border-t">
                         <button (click)="saveFirebaseSetup()" class="bg-green-600 text-white font-bold py-2 px-6 rounded hover:bg-green-700">Simpan & Reload</button>
                         <button (click)="resetFirebaseSetup()" class="text-red-500 font-bold text-sm hover:underline">Reset ke Default</button>
                      </div>
                   </div>
                }

                <!-- DEPLOYMENT VIEW -->
                @if (currentView() === 'deployment') {
                   <div class="p-6 m-6 bg-gray-900 rounded-2xl text-white">
                      <h3 class="font-bold text-xl mb-4">Status & Deployment</h3>
                      
                      @if (isDemoMode()) {
                         <div class="bg-yellow-900/30 border border-yellow-500/30 p-4 rounded mb-6">
                            <h4 class="font-bold text-yellow-400 flex items-center gap-2">
                               Mode Local / Demo Aktif
                            </h4>
                            <p class="text-sm text-gray-300 mt-2">
                               Website ini berjalan tanpa database cloud (karena error koneksi atau permission). 
                               Data Anda tersimpan aman di browser ini saja.
                            </p>
                         </div>
                      } @else {
                         <div class="bg-green-900/30 border border-green-500/30 p-4 rounded mb-6">
                            <h4 class="font-bold text-green-400 flex items-center gap-2">
                               Terhubung ke Firebase Cloud
                            </h4>
                            <p class="text-sm text-gray-300 mt-2">
                               Semua perubahan disinkronkan ke server secara real-time.
                            </p>
                         </div>
                      }

                      <div class="space-y-6">
                         <div class="space-y-2">
                            <p class="text-gray-400 text-sm uppercase font-bold">Langkah Upload Rules (Jika menggunakan project sendiri)</p>
                            <div class="bg-black p-4 rounded border border-gray-700 font-mono text-sm">
                               <p class="text-gray-500 mb-2"># Jalankan perintah ini di terminal laptop:</p>
                               <p class="text-green-400 font-bold mb-4">firebase deploy --only firestore:rules</p>
                            </div>
                         </div>
                      </div>
                   </div>
                }

              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class AdminComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  isAuthenticated = this.configService.isAdmin;
  isFirebaseReady = this.configService.isFirebaseReady;
  firestoreError = this.configService.firestoreError;
  isDemoMode = this.configService.isDemoMode;
  
  isOpen = signal(false);
  emailInput = signal('');
  passwordInput = signal('');
  showPassword = signal(false);
  isLoggingIn = signal(false);
  isUploading = signal(false);
  loginError = signal('');
  
  currentView = signal<'dashboard'|'design'|'media'|'menu'|'kontak'|'intro'|'ai'|'deployment'|'setup'>('dashboard');
  
  designSection = signal<'global'|'hero'|'about'|'menuPage'|'reservation'|'locationPage'|'footer'>('global');
  selectedBranchIndex = signal(0);
  currentYear = new Date().getFullYear();

  tempConfig: FirebaseConfig = {
    apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  };

  constructor() {
    // Show setup page on load if not viewing dashboard
    const current = this.configService.getStoredFirebaseConfig();
    if (current) {
      this.tempConfig = {...current};
    }
  }

  // ... (Method login, logout, togglePanel, dsb tetap sama) ...
  
  togglePanel() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }

  togglePasswordVisibility() { this.showPassword.update(v => !v); }
  
  getTitle(): string {
    const map: any = {
      'dashboard': 'Panel Admin',
      'design': 'Editor Desain',
      'media': 'Galeri & Ulasan',
      'menu': 'Manajemen Menu',
      'kontak': 'Info Cabang',
      'intro': 'Splash Screen',
      'ai': 'AI Config',
      'deployment': 'Status Server',
      'setup': 'Setup Database'
    };
    return map[this.currentView()] || 'Admin Area';
  }

  async login() {
    if (!this.emailInput() || !this.passwordInput()) {
      this.loginError.set('Isi email dan password.');
      return;
    }
    this.isLoggingIn.set(true);
    this.loginError.set('');
    try {
      await this.configService.loginAdmin(this.emailInput(), this.passwordInput());
      this.currentView.set('dashboard');
      this.passwordInput.set('');
      this.emailInput.set('');
    } catch (err: any) {
      this.loginError.set('Gagal login: ' + err.message);
    } finally {
      this.isLoggingIn.set(false);
    }
  }

  async logout() {
    await this.configService.logoutAdmin();
    this.currentView.set('dashboard');
  }

  async saveChanges() {
    await this.configService.updateConfig({...this.config()});
  }

  saveFirebaseSetup() {
    this.configService.saveStoredFirebaseConfig(this.tempConfig);
  }

  resetFirebaseSetup() {
    if(confirm('Reset konfigurasi database ke default?')) {
        this.configService.resetStoredFirebaseConfig();
    }
  }
  
  activeConfig = computed(() => {
    const section = this.designSection();
    const c: any = this.config();
    return c[section];
  });

  activeStyle = computed(() => {
    const section = this.designSection();
    if (section === 'global') return null;
    const c: any = this.config();
    return c[section]?.style;
  });

  hasProp(obj: any, prop: string): boolean {
    return obj && Object.prototype.hasOwnProperty.call(obj, prop);
  }

  async onFileSelected(event: any, type: string, index?: number) {
     const file = event.target.files[0];
     if(!file) return;
     this.isUploading.set(true); 
     try {
       const url = await this.configService.uploadFile(file, 'uploads');
       if (!url) { this.isUploading.set(false); return; }
       const c = this.config();
       if (type === 'logo') c.global.logoImage = url;
       if (type === 'heroBg') c.hero.bgImage = url;
       if (type === 'aboutImage') c.about.image = url;
       if (type === 'introVideo') c.intro.videoUrl = url;
       if (type === 'branchMap') c.branches[this.selectedBranchIndex()].mapImage = url;
       if (type === 'menuItem' && typeof index === 'number') {
          c.branches[this.selectedBranchIndex()].menu[index].image = url;
       }
       if (type === 'gallery') {
          if (!c.gallery) c.gallery = [];
          c.gallery.push(url);
       }
       this.config.set({...c});
     } catch (err: any) {
       alert("Gagal Memproses Gambar:\n" + err.message);
     } finally {
       this.isUploading.set(false); 
     }
  }

  addMenuItem() {
    this.config().branches[this.selectedBranchIndex()].menu.unshift({
       name: 'Menu Baru', desc: '', price: 'Rp 0', category: 'Umum', image: 'https://picsum.photos/200'
    });
  }
  removeMenuItem(i: number) {
    if(confirm('Hapus menu ini?')) {
      this.config().branches[this.selectedBranchIndex()].menu.splice(i, 1);
    }
  }
  removeGalleryImage(index: number) {
    if(confirm('Hapus foto ini dari galeri?')) {
      this.config().gallery.splice(index, 1);
    }
  }
  addTestimonial() {
    if (!this.config().testimonials) this.config.update(c => ({...c, testimonials: []}));
    this.config().testimonials.push({
      name: 'Pelanggan Baru', text: 'Ulasan...', rating: 5, role: 'Pelanggan'
    });
  }
  removeTestimonial(index: number) {
    if(confirm('Hapus testimoni ini?')) {
      this.config().testimonials.splice(index, 1);
    }
  }
  addBranch() {
    const newBranch: Branch = {
      id: 'cabang-' + Date.now(),
      name: 'Cabang Baru', address: '', googleMapsUrl: '', phone: '', whatsappNumber: '', hours: '09.00 - 21.00',
      mapImage: 'https://picsum.photos/seed/mapNew/400/300', menu: []
    };
    this.config().branches.push(newBranch);
    this.selectedBranchIndex.set(this.config().branches.length - 1);
  }
  removeBranch() {
    if (this.config().branches.length <= 1) { alert('Minimal satu cabang!'); return; }
    if (confirm('Yakin hapus cabang ini?')) {
      this.config().branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
    }
  }
}
