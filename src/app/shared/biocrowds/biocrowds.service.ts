import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SimulationResponse } from './simulationResponse';

import { environment } from './../../../environments/environment';


@Injectable()
export class BioCrowdsService {

    constructor(private http: HttpClient) {}

    simulate(world: any, numberOfFrames: number, randomPathFactor: number): Observable<SimulationResponse> {
        return this.http.post<SimulationResponse>(environment.apiUrl + 'simulation?numberOfFrames=' + numberOfFrames + '&randomPathFactor=' + randomPathFactor, world);
    }

    save(world: any): Observable<any> {
        return this.http.post(environment.apiUrl, world, {observe: 'response'});
    }

    find(id: string): Observable<any> {
        return this.http.get(environment.apiUrl + id);
    }
}
