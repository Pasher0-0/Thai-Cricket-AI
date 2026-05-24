import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// 1. นำเข้าเครื่องมือสำหรับจัดการ HTTP Request
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS } from '@angular/common/http'; 
import { ApiProxyInterceptor } from './services/api-proxy.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(withEventReplay()),
    
    // 2. เพิ่มคำสั่งนี้ลงไปใน Array เพื่อให้แอปยิง API ได้
    provideHttpClient(withFetch()),
    
    // 3. เพิ่ม HTTP Interceptor สำหรับ proxy /api/* requests ไปหา HF Space
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiProxyInterceptor,
      multi: true
    }
  ]
};