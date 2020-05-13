import { TestBed, inject } from '@angular/core/testing';

import { GovernmentManagementService } from './government-management.service';

describe('GovernmentManagementService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GovernmentManagementService]
        });
    });

    it('should be created', inject([GovernmentManagementService], (service: GovernmentManagementService) => {
        expect(service).toBeTruthy();
    }));
});
