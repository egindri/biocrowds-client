export class WorldResponse {
	agentGroups: { 
		agentInitialPositions: THREE.Vector3[],
		pathPredictions: THREE.Vector3[],
		goal: THREE.Vector3
	}[];
	obstacles: any[];
}