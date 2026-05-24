import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CricketApiService {
  private http = inject(HttpClient);
  
  // Call HF Space backend directly (CORS configured to allow Vercel domain)
  private hfSpaceUrl = 'https://pasher0-0-cricket-api.hf.space/predict';
  
  predictAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(this.hfSpaceUrl, formData);
  }
}