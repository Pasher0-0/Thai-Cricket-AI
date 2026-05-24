import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// 1. นำเข้าเครื่องมือสำหรับจัดการ HTTP Request
import { provideHttpClient, withFetch } from '@angular/common/http'; 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    
    // 2. เพิ่มคำสั่งนี้ลงไปใน Array เพื่อให้แอปยิง API ได้
    provideHttpClient(withFetch()) 
  ]
};