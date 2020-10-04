export class WorldResponse {
	agentGroups: { 
		agentInitialPositions: THREE.Vector3[],
		pathPredictions: THREE.Vector3[],
		goal: THREE.Vector3
	}[];
	obstacles: {
		a: THREE.Vector3,
		b: THREE.Vector3
	}[];
}