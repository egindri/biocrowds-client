import { TestBed, inject } from '@angular/core/testing';

import { BioCrowdsService } from './biocrowds.service';

describe('BioCrowdsService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [BioCrowdsService]
        });
    });

    it('should be created', inject([BioCrowdsService], (service: BioCrowdsService) => {
        expect(service).toBeTruthy();
    }));
});
