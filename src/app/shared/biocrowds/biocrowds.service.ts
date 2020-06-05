import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from './../../../environments/environment';


@Injectable()
export class BioCrowdsService {

    constructor(private http: HttpClient) {}

    simulate(world: any, numberOfFrames: number, randomPathFactor: number): Observable<any> {
        return this.http.post(environment.apiUrl + 'simulation?numberOfFrames=' + numberOfFrames
                                                 + '&randomPathFactor=' + randomPathFactor, world);
    }
}
