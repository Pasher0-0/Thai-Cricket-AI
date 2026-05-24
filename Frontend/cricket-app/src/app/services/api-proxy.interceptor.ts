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
    // Match /api/* in both relative and absolute URLs
    const apiMatch = request.url.match(/\/api\/(.*)/);
    
    if (apiMatch) {
      const path = apiMatch[1];
      const newUrl = `${this.hfSpaceUrl}/${path}`;
      
      // Clone request with new URL, preserving method, body, headers
      const newRequest = request.clone({
        url: newUrl,
      });
      
      console.log('Intercepting API request:', request.url, '→', newUrl);
      
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
