import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ApiProxyInterceptor implements HttpInterceptor {
  private hfSpaceUrl = 'https://pasher0-0-cricket-api.hf.space';

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // If request starts with /api/, rewrite to HF Space URL
    if (request.url.startsWith('/api/')) {
      const path = request.url.replace(/^\/api\//, '');
      const newUrl = `${this.hfSpaceUrl}/${path}`;
      
      // Clone request with new URL, preserving method, body, headers
      const newRequest = request.clone({
        url: newUrl,
      });
      
      return next.handle(newRequest).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('API Proxy Error:', error);
          return throwError(() => error);
        })
      );
    }

    // Pass through non-/api/ requests unchanged
    return next.handle(request);
  }
}
