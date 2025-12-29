
import { Component, inject, signal, effect, CUSTOM_ELEMENTS_SCHEMA, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfigService, MenuItem, Branch } from '../services/config.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <!-- Floating Admin Button -->
    <button 
      (click)="togglePanel()"
      class="fixed bottom-6 left-6 z-50 bg-gray-800 text-white p-4 rounded-full shadow-2xl hover:bg-gray-700 transition-transform hover:scale-110 border-2 border-white"
      title="Admin Panel"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>

    <!-- Admin Panel Overlay -->
    @if (isOpen()) {
      <div class="fixed inset-0 z-[60] flex justify-end cursor-auto">
        <!-- Backdrop -->
        <div (click)="togglePanel()" class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

        <!-- Sidebar Container -->
        <div class="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto flex flex-col animate-slide-in">
          
          <!-- Close Button -->
          <button (click)="togglePanel()" class="absolute top-4 right-4 text-gray-500 hover:text-red-500 z-20 bg-white rounded-full p-1 shadow-sm border">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
             </svg>
          </button>

          @if (!isAuthenticated()) {
            <!-- Login Form -->
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-6 bg-gray-50">
              <div class="bg-brand-cream p-4 rounded-full shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-brand-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-800">Login Admin</h2>
                <p class="text-gray-500 text-sm mt-1">Masukkan password untuk mengelola.</p>
              </div>
              
              <div class="w-full max-w-xs space-y-4">
                  <div class="relative">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      [(ngModel)]="passwordInput" 
                      placeholder="Password" 
                      class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm text-center pr-10 outline-none focus:ring-2 focus:ring-brand-orange shadow-sm"
                      style="background-color: #ffffff !important; color: #000000 !important;"
                    >
                    <button 
                      type="button"
                      (click)="togglePasswordVisibility()" 
                      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-brand-orange focus:outline-none z-10 p-1"
                    >
                      @if (showPassword()) {
                        <!-- Eye Off Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      } @else {
                        <!-- Eye Icon -->
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      }
                    </button>
                  </div>
                  <button (click)="login()" class="w-full bg-brand-orange text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition shadow-lg">Masuk</button>
              </div>
            </div>

          } @else {
            
            <!-- Dashboard View -->
            <div class="flex flex-col h-full bg-gray-50">
              
              <!-- Header -->
              <div class="p-6 border-b bg-white flex justify-between items-center shadow-sm z-10 sticky top-0">
                <div class="flex items-center gap-3">
                  @if (currentView() !== 'dashboard') {
                    <button (click)="currentView.set('dashboard')" class="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                  }
                  <h2 class="text-xl font-bold text-gray-800">{{ getTitle() }}</h2>
                </div>
                <button (click)="logout()" class="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Logout</button>
              </div>

              <!-- Main Content Area -->
              <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
                
                <!-- DASHBOARD MENU -->
                @if (currentView() === 'dashboard') {
                  <div class="grid grid-cols-2 gap-4">
                    <!-- Unified Editor -->
                    <button (click)="currentView.set('design')" class="col-span-2 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 mb-3 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       <span class="font-bold text-lg">Editor Halaman & Desain</span>
                       <span class="text-xs opacity-80 mt-1">Warna, Font, Text & Foto</span>
                    </button>

                    <button (click)="currentView.set('menu')" class="dashboard-btn group">
                      <div class="icon-circle bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Daftar Menu</span>
                    </button>

                    <button (click)="currentView.set('kontak')" class="dashboard-btn group">
                      <div class="icon-circle bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Cabang</span>
                    </button>

                     <button (click)="currentView.set('intro')" class="dashboard-btn group">
                       <div class="icon-circle bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       </div>
                       <span class="font-bold text-gray-700">Video Intro</span>
                    </button>

                    <button (click)="currentView.set('ai')" class="dashboard-btn group">
                      <div class="icon-circle bg-teal-100 text-teal-600 group-hover:bg-teal-600 group-hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      </div>
                      <span class="font-bold text-gray-700">Asisten AI</span>
                    </button>
                  </div>
                }

                <!-- UNIFIED DESIGN EDITOR -->
                @if (currentView() === 'design') {
                   <div class="animate-slide-in pb-10">
                     
                     <!-- Page Selector -->
                     <div class="sticky top-0 bg-gray-50 pb-6 pt-2 z-10 border-b border-gray-200 mb-6">
                        <label class="block text-xs font-extrabold text-blue-800 uppercase mb-2 tracking-wide">
                          Pilih Halaman / Bagian yang Diedit:
                        </label>
                        <select [(ngModel)]="designSection" class="w-full bg-white text-gray-900 border-2 border-blue-500 rounded-lg px-4 py-3 font-bold shadow-md focus:ring-4 focus:ring-blue-200 outline-none text-base cursor-pointer" style="background-color: #ffffff !important; color: #000000 !important;">
                          <option value="global">🎨 Global (Logo, Navbar, Font)</option>
                          <option value="hero">🏠 Halaman Beranda (Hero)</option>
                          <option value="about">ℹ️ Bagian Tentang (About)</option>
                          <option value="menuPage">🍲 Halaman Menu</option>
                          <option value="reservation">📅 Halaman Reservasi</option>
                          <option value="locationPage">📍 Halaman Lokasi</option>
                          <option value="footer">🦶 Footer (Bawah)</option>
                        </select>
                     </div>

                     <div class="space-y-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                       <!-- GLOBAL SETTINGS -->
                       @if (designSection() === 'global') {
                          <div class="space-y-6">
                             <div class="border-b pb-2 mb-4">
                               <h3 class="font-bold text-lg text-gray-800">Identitas & Navigasi</h3>
                               <p class="text-xs text-gray-500">Pengaturan ini berlaku untuk seluruh halaman.</p>
                             </div>
                             
                             <div>
                                <label class="label">Nama Brand / Logo Text</label>
                                <input type="text" [(ngModel)]="config().global.logoText" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                             </div>
                             <div>
                                <label class="label">Logo Image (Opsional)</label>
                                <div class="flex items-center gap-3">
                                   <div class="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center overflow-hidden">
                                     <img *ngIf="config().global.logoImage" [src]="config().global.logoImage" class="w-full h-full object-contain">
                                     <span *ngIf="!config().global.logoImage" class="text-xs text-gray-400">No img</span>
                                   </div>
                                   <input type="file" (change)="onFileSelected($event, 'logo')" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                </div>
                             </div>
                             
                             <div class="grid grid-cols-2 gap-6">
                                <div>
                                  <label class="label">Warna Navbar (Background)</label>
                                  <div class="flex items-center gap-2">
                                    <input type="color" [(ngModel)]="config().global.navbarColor" class="w-12 h-12 p-1 bg-white border rounded cursor-pointer" style="background-color: #ffffff !important;">
                                    <input type="text" [(ngModel)]="config().global.navbarColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                                <div>
                                  <label class="label">Warna Teks Navbar</label>
                                  <div class="flex items-center gap-2">
                                    <input type="color" [(ngModel)]="config().global.navbarTextColor" class="w-12 h-12 p-1 bg-white border rounded cursor-pointer" style="background-color: #ffffff !important;">
                                    <input type="text" [(ngModel)]="config().global.navbarTextColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             </div>
                          </div>
                       }

                       <!-- DYNAMIC PAGE EDITOR -->
                       @if (designSection() !== 'global') {
                          
                          <!-- Content Editor -->
                          <div class="space-y-6">
                             <div class="border-b pb-2 mb-4">
                               <h3 class="font-bold text-lg text-gray-800">Konten Teks & Media</h3>
                             </div>
                             
                             @if (hasProp(activeConfig(), 'title')) {
                               <div>
                                  <label class="label">Judul Utama (Headline)</label>
                                  <input type="text" [(ngModel)]="activeConfig().title" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold" style="background-color: #ffffff !important; color: #000000 !important;">
                               </div>
                             }
                             @if (hasProp(activeConfig(), 'subtitle')) {
                               <div>
                                  <label class="label">Sub-Judul / Deskripsi Singkat</label>
                                  <textarea [(ngModel)]="activeConfig().subtitle" rows="3" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                               </div>
                             }
                             @if (hasProp(activeConfig(), 'highlight')) {
                               <div>
                                  <label class="label">Teks Highlight (Biasanya berwarna beda)</label>
                                  <input type="text" [(ngModel)]="activeConfig().highlight" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-brand-orange" style="background-color: #ffffff !important; color: #000000 !important;">
                               </div>
                             }
                             @if (hasProp(activeConfig(), 'description')) {
                               <div>
                                  <label class="label">Deskripsi Lengkap</label>
                                  <textarea [(ngModel)]="activeConfig().description" rows="6" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                               </div>
                             }
                             
                             <!-- Specific Image Uploads -->
                             @if (hasProp(activeConfig(), 'bgImage')) {
                                <div>
                                  <label class="label">Background Image</label>
                                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                                     <img [src]="activeConfig().bgImage" class="h-32 mx-auto object-cover rounded mb-2 shadow">
                                     <input type="file" (change)="onFileSelected($event, 'heroBg')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" style="background-color: #ffffff !important;">
                                  </div>
                                </div>
                             }
                             @if (hasProp(activeConfig(), 'image')) {
                                <div>
                                  <label class="label">Gambar Utama</label>
                                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                                     <img [src]="activeConfig().image" class="h-32 mx-auto object-cover rounded mb-2 shadow">
                                     <input type="file" (change)="onFileSelected($event, 'aboutImage')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" style="background-color: #ffffff !important;">
                                  </div>
                                </div>
                             }

                             <!-- Reservation Specifics -->
                             @if (designSection() === 'reservation') {
                                <div class="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
                                  <div>
                                     <label class="label">Min Pax Reguler</label>
                                     <input type="number" [(ngModel)]="config().reservation.minPaxRegular" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                  <div>
                                     <label class="label">Min Pax Ramadan</label>
                                     <input type="number" [(ngModel)]="config().reservation.minPaxRamadan" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             }

                             <!-- Footer Specifics -->
                             @if (designSection() === 'footer') {
                                <div class="space-y-4">
                                  <div>
                                     <label class="label">Link Instagram</label>
                                     <input type="text" [(ngModel)]="config().footer.instagramLink" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                   <div>
                                     <label class="label">Link Facebook</label>
                                     <input type="text" [(ngModel)]="config().footer.facebookLink" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                   <div>
                                     <label class="label">Link TikTok</label>
                                     <input type="text" [(ngModel)]="config().footer.tiktokLink" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             }
                          </div>

                          <!-- STYLE EDITOR -->
                          <div class="space-y-6 pt-8 mt-8 border-t-2 border-gray-100">
                             <div class="flex items-center gap-2 mb-4">
                               <span class="bg-orange-100 text-orange-600 p-2 rounded-lg">
                                 <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.355m0 0l2.698 2.606a1 1 0 101.414-1.414l-4.242-4.242a1 1 0 00-1.414 0l-4.242 4.242a1 1 0 101.414 1.414L11 7.343z" /></svg>
                               </span>
                               <h3 class="font-bold text-lg text-gray-800">Tampilan Visual</h3>
                             </div>
                             
                             <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div>
                                  <label class="label">Background</label>
                                  <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="activeStyle().backgroundColor" class="w-10 h-10 rounded border bg-white cursor-pointer p-1" style="background-color: #ffffff !important;">
                                     <input type="text" [(ngModel)]="activeStyle().backgroundColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                                <div>
                                  <label class="label">Warna Teks</label>
                                   <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="activeStyle().textColor" class="w-10 h-10 rounded border bg-white cursor-pointer p-1" style="background-color: #ffffff !important;">
                                     <input type="text" [(ngModel)]="activeStyle().textColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                                <div>
                                  <label class="label">Warna Aksen</label>
                                   <div class="flex items-center gap-2">
                                     <input type="color" [(ngModel)]="activeStyle().accentColor" class="w-10 h-10 rounded border bg-white cursor-pointer p-1" style="background-color: #ffffff !important;">
                                     <input type="text" [(ngModel)]="activeStyle().accentColor" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-xs" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                </div>
                             </div>

                             <div>
                                <label class="label">Jenis Font (Typography)</label>
                                <select [(ngModel)]="activeStyle().fontFamily" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" style="background-color: #ffffff !important; color: #000000 !important;">
                                   <option value="Playfair Display">Playfair Display (Serif/Elegan)</option>
                                   <option value="Lato">Lato (Modern/Clean)</option>
                                   <option value="Montserrat">Montserrat (Tegas)</option>
                                   <option value="Oswald">Oswald (Kuat/Judul)</option>
                                   <option value="Lora">Lora (Klasik)</option>
                                   <option value="Raleway">Raleway (Artistik)</option>
                                   <option value="Open Sans">Open Sans (Netral)</option>
                                   <option value="Roboto">Roboto (Geometris)</option>
                                   <option value="Merriweather">Merriweather (Bacaan Enak)</option>
                                </select>
                             </div>
                             
                             <div class="bg-blue-50 p-4 rounded-lg text-xs text-blue-800 border border-blue-100 flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>Perubahan warna dan font di atas hanya berlaku untuk halaman <strong>{{ designSection() }}</strong>.</span>
                             </div>
                          </div>
                       }
                     </div>
                   </div>
                }

                <!-- MENU EDITOR -->
                @if (currentView() === 'menu') {
                   <div class="space-y-6 animate-slide-in pb-10">
                     <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                       <div>
                         <label class="label">Pilih Cabang untuk Diedit</label>
                         <select [ngModel]="selectedBranchIndex()" (ngModelChange)="selectedBranchIndex.set(+$event)" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold bg-gray-50" style="background-color: #ffffff !important; color: #000000 !important;">
                           @for (branch of config().branches; track $index) {
                             <option [value]="$index">{{ branch.name }}</option>
                           }
                         </select>
                       </div>
                       <button (click)="addMenuItem()" class="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-md">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                         Tambah Menu Baru
                       </button>
                     </div>

                     <div class="space-y-6">
                       @for (item of config().branches[selectedBranchIndex()].menu; track $index) {
                         <div class="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition relative group">
                            <button (click)="removeMenuItem($index)" class="absolute top-2 right-2 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition z-10">
                               <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <div class="flex flex-col sm:flex-row gap-5">
                              <!-- Image Upload -->
                               <div class="w-full sm:w-32 h-32 bg-gray-100 rounded-lg flex-shrink-0 relative overflow-hidden border">
                                  <img [src]="item.image" class="w-full h-full object-cover">
                                  <label class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                                     Ganti Foto
                                     <input type="file" (change)="onFileSelected($event, 'menuItem', $index)" class="hidden">
                                  </label>
                               </div>
                               
                               <!-- Inputs -->
                               <div class="flex-1 space-y-3">
                                  <div>
                                    <label class="text-[10px] font-bold text-gray-500 uppercase">Nama Menu</label>
                                    <input [(ngModel)]="item.name" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold" placeholder="Contoh: Sate Ayam" style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                                  <div class="flex gap-3">
                                     <div class="flex-1">
                                        <label class="text-[10px] font-bold text-gray-500 uppercase">Harga</label>
                                        <input [(ngModel)]="item.price" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-green-700 font-bold" placeholder="Rp 15.000" style="background-color: #ffffff !important; color: #000000 !important;">
                                     </div>
                                     <div class="flex-1">
                                        <label class="text-[10px] font-bold text-gray-500 uppercase">Kategori</label>
                                        <input [(ngModel)]="item.category" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Makanan/Minuman" style="background-color: #ffffff !important; color: #000000 !important;">
                                     </div>
                                  </div>
                                  <div>
                                     <label class="text-[10px] font-bold text-gray-500 uppercase">Deskripsi</label>
                                     <input [(ngModel)]="item.desc" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm" placeholder="Keterangan menu..." style="background-color: #ffffff !important; color: #000000 !important;">
                                  </div>
                               </div>
                            </div>
                         </div>
                       }
                     </div>
                   </div>
                }
                
                <!-- CABANG EDITOR -->
                @if (currentView() === 'kontak') {
                   <div class="space-y-6 animate-slide-in pb-10">
                       <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                         <div class="flex justify-between items-center">
                            <label class="label mb-0">Pilih Cabang</label>
                            <div class="flex gap-2">
                              <button (click)="addBranch()" class="text-xs bg-green-600 text-white px-3 py-2 rounded font-bold hover:bg-green-700 transition flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                Tambah
                              </button>
                            </div>
                         </div>

                         <div class="flex gap-2">
                           <select [ngModel]="selectedBranchIndex()" (ngModelChange)="selectedBranchIndex.set(+$event)" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold bg-gray-50" style="background-color: #ffffff !important; color: #000000 !important;">
                             @for (branch of config().branches; track $index) {
                               <option [value]="$index">{{ branch.name }}</option>
                             }
                           </select>
                           
                           <button (click)="removeBranch()" class="bg-red-100 text-red-600 px-4 rounded-lg hover:bg-red-200 transition border border-red-200" title="Hapus Cabang Ini">
                             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                           </button>
                         </div>
                         
                         <div class="p-4 bg-orange-50 text-orange-800 text-xs rounded border border-orange-200">
                           Tips: Pastikan nomor WhatsApp diawali kode negara (62) tanpa tanda plus (+).
                         </div>
                       </div>

                       <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-5">
                           <div>
                              <label class="label">Nama Cabang</label>
                              <input [(ngModel)]="config().branches[selectedBranchIndex()].name" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-bold" placeholder="Nama Cabang" style="background-color: #ffffff !important; color: #000000 !important;">
                           </div>
                           <div>
                              <label class="label">Alamat Lengkap</label>
                              <textarea [(ngModel)]="config().branches[selectedBranchIndex()].address" rows="3" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Alamat" style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                           </div>
                           <div class="grid grid-cols-2 gap-4">
                              <div>
                                <label class="label">No Telepon (Tampilan)</label>
                                <input [(ngModel)]="config().branches[selectedBranchIndex()].phone" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="022-XXXX" style="background-color: #ffffff !important; color: #000000 !important;">
                              </div>
                              <div>
                                <label class="label">No WhatsApp (Sistem)</label>
                                <input [(ngModel)]="config().branches[selectedBranchIndex()].whatsappNumber" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono text-blue-600" placeholder="628123..." style="background-color: #ffffff !important; color: #000000 !important;">
                              </div>
                           </div>
                           <div>
                              <label class="label">Link Google Maps</label>
                              <input [(ngModel)]="config().branches[selectedBranchIndex()].googleMapsUrl" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-xs" placeholder="https://maps.google.com/..." style="background-color: #ffffff !important; color: #000000 !important;">
                           </div>
                           <div>
                              <label class="label">Jam Operasional</label>
                              <input [(ngModel)]="config().branches[selectedBranchIndex()].hours" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="09.00 - 21.00 WIB" style="background-color: #ffffff !important; color: #000000 !important;">
                           </div>
                       </div>
                   </div>
                }

                <!-- INTRO EDITOR -->
                @if (currentView() === 'intro') {
                   <div class="space-y-6 animate-slide-in bg-white p-6 rounded-xl border border-gray-200 shadow-sm pb-10">
                      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                         <input type="checkbox" [(ngModel)]="config().intro.enabled" id="introToggle" class="w-6 h-6 rounded border-gray-300 text-brand-orange focus:ring-brand-orange cursor-pointer"> 
                         <label for="introToggle" class="text-sm font-bold text-gray-800 cursor-pointer select-none">Aktifkan Video Intro</label>
                      </div>
                      
                      <div>
                        <label class="label">Efek Animasi Keluar (Fade Out)</label>
                        <select [(ngModel)]="config().intro.fadeOut" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm cursor-pointer" style="background-color: #ffffff !important; color: #000000 !important;">
                            <option value="none">Tidak Ada (Langsung Hilang)</option>
                            <option value="fade">Fade Out (Pudar Perlahan)</option>
                            <option value="slide-up">Slide Up (Geser Naik)</option>
                            <option value="slide-down">Slide Down (Geser Turun)</option>
                            <option value="zoom-out">Zoom Out (Mengecil)</option>
                        </select>
                      </div>

                      <div>
                         <label class="label">File Video</label>
                         <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50">
                            @if (config().intro.videoUrl) {
                               <video [src]="config().intro.videoUrl" class="h-40 mb-4 rounded shadow bg-black" controls></video>
                               <button (click)="config().intro.videoUrl = ''" class="text-red-500 text-xs font-bold underline mb-4">Hapus Video</button>
                            }
                            <input type="file" (change)="onFileSelected($event, 'introVideo')" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" style="background-color: #ffffff !important;">
                         </div>
                      </div>
                   </div>
                }

                <!-- AI EDITOR -->
                @if (currentView() === 'ai') {
                   <div class="space-y-6 animate-slide-in pb-10">
                     <div class="bg-teal-50 p-4 rounded-xl border border-teal-200 text-teal-800 text-sm">
                        🤖 <strong>Tips AI:</strong> Instruksi sistem menentukan kepribadian AI. Berikan instruksi yang jelas agar AI ramah dan membantu.
                     </div>

                     <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
                       <div>
                         <label class="label">Instruksi Sistem (System Prompt)</label>
                         <textarea [(ngModel)]="config().ai.systemInstruction" rows="10" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm font-mono text-sm leading-relaxed" placeholder="Anda adalah asisten..." style="background-color: #ffffff !important; color: #000000 !important;"></textarea>
                       </div>
                       
                       <div>
                         <label class="label">Pesan Pembuka Chat</label>
                         <input [(ngModel)]="config().ai.initialMessage" class="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" placeholder="Halo! Ada yang bisa saya bantu?" style="background-color: #ffffff !important; color: #000000 !important;">
                       </div>
                     </div>
                   </div>
                }

              </div>

              <!-- Footer Actions -->
              @if (currentView() !== 'dashboard') {
                <div class="p-6 border-t bg-white z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                   <button (click)="saveChanges()" class="w-full py-4 bg-brand-brown text-white rounded-xl font-bold text-lg shadow-lg hover:bg-opacity-90 transition transform hover:scale-[1.01]">
                     Simpan Perubahan
                   </button>
                   <div class="text-center mt-3">
                     <button (click)="currentView.set('dashboard')" class="text-sm text-gray-500 hover:text-gray-800 font-medium py-2 px-4 rounded hover:bg-gray-100 transition">
                       ← Kembali ke Dashboard
                     </button>
                   </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .label { @apply block text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide; }
    .dashboard-btn { @apply flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 transition h-32; }
    .icon-circle { @apply w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors duration-300; }
    .animate-slide-in { animation: slideIn 0.3s ease-out; }
    @keyframes slideIn { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  `]
})
export class AdminComponent {
  configService = inject(ConfigService);
  config = this.configService.config;
  
  isOpen = signal(false);
  isAuthenticated = signal(false);
  passwordInput = signal('');
  showPassword = signal(false);
  loginError = signal('');
  
  currentView = signal<'dashboard'|'design'|'menu'|'kontak'|'intro'|'ai'>('dashboard');
  
  designSection = signal<'global'|'hero'|'about'|'menuPage'|'reservation'|'locationPage'|'footer'>('global');
  selectedBranchIndex = signal(0);

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

  togglePanel() {
    this.isOpen.update(v => !v);
    // Toggle admin-mode on body to restore default cursor
    if (this.isOpen()) {
      document.body.classList.add('admin-mode');
    } else {
      document.body.classList.remove('admin-mode');
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }
  
  getTitle(): string {
    const map: any = {
      'dashboard': 'Panel Admin',
      'design': 'Editor Desain & Konten',
      'menu': 'Manajemen Menu',
      'kontak': 'Info Cabang',
      'intro': 'Video Intro',
      'ai': 'Pengaturan AI'
    };
    return map[this.currentView()] || 'Admin';
  }

  login() {
    if (this.passwordInput() === 'admin123') this.isAuthenticated.set(true);
  }

  logout() {
    this.isAuthenticated.set(false);
    this.currentView.set('dashboard');
  }

  saveChanges() {
    this.configService.updateConfig({...this.config()});
    alert('Pengaturan berhasil disimpan!');
  }

  onFileSelected(event: any, type: string, index?: number) {
     const file = event.target.files[0];
     if(!file) return;
     const reader = new FileReader();
     reader.onload = (e: any) => {
        const res = e.target.result;
        const c = this.config();
        
        if (type === 'logo') c.global.logoImage = res;
        if (type === 'heroBg') c.hero.bgImage = res;
        if (type === 'aboutImage') c.about.image = res;
        if (type === 'introVideo') c.intro.videoUrl = res;
        if (type === 'menuItem' && typeof index === 'number') {
           c.branches[this.selectedBranchIndex()].menu[index].image = res;
        }
        this.configService.updateConfig({...c});
     };
     reader.readAsDataURL(file);
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

  addBranch() {
    const newBranch: Branch = {
      id: 'cabang-' + Date.now(),
      name: 'Cabang Baru',
      address: '',
      googleMapsUrl: '',
      phone: '',
      whatsappNumber: '',
      hours: '09.00 - 21.00',
      mapImage: 'https://picsum.photos/seed/mapNew/400/300',
      menu: []
    };
    this.config().branches.push(newBranch);
    this.selectedBranchIndex.set(this.config().branches.length - 1);
  }

  removeBranch() {
    if (this.config().branches.length <= 1) {
      alert('Minimal harus ada satu cabang!');
      return;
    }
    if (confirm('Yakin ingin menghapus cabang ini? Data menu di cabang ini juga akan hilang.')) {
      this.config().branches.splice(this.selectedBranchIndex(), 1);
      this.selectedBranchIndex.set(0);
    }
  }
}
