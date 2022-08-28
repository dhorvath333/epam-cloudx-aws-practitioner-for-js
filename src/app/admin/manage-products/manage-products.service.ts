import { Injectable, Injector } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class ManageProductsService extends ApiService {
  constructor(injector: Injector) {
    super(injector);
  }

  uploadProductsCSV(file: File): Observable<unknown> {
    if (!this.endpointEnabled('import')) {
      console.warn(
        'Endpoint "import" is disabled. To enable change your environment.ts config'
      );
      return EMPTY;
    }

    return this.getPreSignedUrl(file.name).pipe(
      switchMap((url) =>
        this.http.put(url, file, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'text/csv',
          },
        })
      )
    );
  }

  private getPreSignedUrl(fileName: string): Observable<string> {
    const url = this.getUrl('import', 'import');
    const authorizationToken = this.getAuthorizationTokenBase64();

    return this.http.get<string>(url, {
      params: {
        name: fileName,
      },
      headers: {
        authorization: `Basic ${authorizationToken}`,
      },
    });
  }

  private getAuthorizationTokenBase64(): string {
    const authorizationToken =
      localStorage.getItem('authorization_token') || '';

    try {
      const base64EncodedAuthorizationToken = btoa(authorizationToken);
      return base64EncodedAuthorizationToken;
    } catch (error) {
      console.log(
        `Error while base64 encoding authorization token ${authorizationToken}: `,
        error
      );
      return '';
    }
  }
}
