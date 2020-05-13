import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable()
export class GovernmentManagementService {

    constructor(private http: HttpClient) {}

    saveState(state: any): Observable<any> {
        return this.http.post('//localhost:8080/states', state);
    }

    loadStates(): Observable<any> {
        return this.http.get('//localhost:8080/states');
    }

    saveCities(state: any): Observable<any> {
        return this.http.post('//localhost:8080/cities', state);
    }

    loadCities(): Observable<any> {
        return this.http.get('//localhost:8080/cities');
    }

    removeCity(id: number): Observable<any> {
        return this.http.delete('//localhost:8080/cities/' + id);
    }
}
