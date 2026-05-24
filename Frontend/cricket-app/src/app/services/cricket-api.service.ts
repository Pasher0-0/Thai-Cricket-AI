import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CricketApiService {
  // เรียกใช้ HttpClient ผ่านฟังก์ชัน inject() แบบฉบับ Angular 17
  private http = inject(HttpClient);
  
  // URL ของเซิร์ฟเวอร์ Python ที่เราเปิดทิ้งไว้
  private apiUrl = '/api/predict';
  // ฟังก์ชันรับไฟล์เสียงแล้วยิงไปหาเซิร์ฟเวอร์
 predictAudio(file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);
  return this.http.post<any>('/api/predict', formData);
}
}