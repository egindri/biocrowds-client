import {Component, ViewChild, ElementRef, AfterViewInit, HostListener, Inject } from '@angular/core';
import { Location } from '@angular/common';
import { APP_BASE_HREF } from '@angular/common';
import * as THREE from 'three';
import { BioCrowdsService } from '../shared/biocrowds/biocrowds.service';
import { Info } from './info';

@Component({
    selector: 'app-biocrowds',
    templateUrl: './biocrowds.component.html',
    styleUrls: ['./biocrowds.component.css']
})
export class BioCrowdsComponent implements AfterViewInit {

    @ViewChild('container') container: ElementRef;

    materials = [new THREE.MeshBasicMaterial({color: 0xaa7aff}),
                new THREE.MeshBasicMaterial({color: 0xff73e1}),
               	new THREE.MeshBasicMaterial({color: 0x45f0e0}),
               	new THREE.MeshBasicMaterial({color: 0xabf475}),
               	new THREE.MeshBasicMaterial({color: 0x78a1ff})];

    sphereGeometry = new THREE.SphereGeometry(5);
	ringGeometry = new THREE.RingGeometry(20, 4, 20);

    canvasWidth: number;
    canvasHeight: number;

    agentPositions = [[[new THREE.Vector3(40, 20, 0), new THREE.Vector3(50, 20, 0)]]];
    goals: THREE.Vector3[] = [new THREE.Vector3(80, 50, 0)];
    obstacles: any[] = [{a: new THREE.Vector3(50, 50, 0), b: new THREE.Vector3(60, 60, 0)}];
	paths: THREE.Vector3[][] = [];
	newPath = [];
	infos: Info[] = [];

    playing = false;
    dirty = true;
    loading = false;

    currentPosition = 0;
    delta = 0;
    fps = 20;

	responseTime = 0;

	clock = new THREE.Clock();

    groupIndex = 0;

	clicking = false;

    selectedTool: string;
    mousePosition = new THREE.Vector3(0, 0, 0);

    randomPaths = false;

    currentPoint = new THREE.Vector3(-1, -1, -1);

    obstacleMaterial = new THREE.MeshBasicMaterial({color: 0xff9038});

	elapsedTime = 0;
	

    constructor(private bioCrowdsService: BioCrowdsService, private location: Location, @Inject(APP_BASE_HREF) public baseHref: string) {}

    ngAfterViewInit() {

        const id = window.location.pathname.replace(this.baseHref, '');

        if (id) {
            this.bioCrowdsService.find(id).subscribe(res => {
                                                   		this.agentPositions[0] = res.agentGroups.map(ag => ag.agentInitialPositions.map(p => new THREE.Vector3(p.x, p.y, p.z)));
                                                        this.goals = res.agentGroups.map(ag => ag.goal);
                                                        this.obstacles = res.obstacles;
                                                    })
        }

        const renderer = new THREE.WebGLRenderer();

        this.container.nativeElement.appendChild(renderer.domElement);

        const animate = () => {
            requestAnimationFrame(animate);
			this.handleFrame(renderer);
        };

        animate();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.mousePosition = this.obtainMousePosition(event);
    }

    @HostListener('document:touchstart', ['$event'])
    @HostListener('document:pointerdown', ['$event'])
    onMouseDown() {
		this.clicking = true;
    }

    @HostListener('document:touchend', ['$event'])
    @HostListener('document:pointerup', ['$event'])
    onMouseUp() {
		this.clicking = false;
    }

	handleFrame(renderer: THREE.WebGLRenderer) {
		this.delta += this.currentPosition > 0 ? this.clock.getDelta() : 0;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xEEEEEE);

        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;

        let camera = new THREE.OrthographicCamera(this.container.nativeElement.offsetLeft,
                                                  this.container.nativeElement.offsetLeft + this.canvasWidth,
                                                  this.container.nativeElement.offsetTop,
                                                  this.container.nativeElement.offsetTop + this.canvasHeight,
                                                  -10, 10);

		this.elapsedTime = this.currentPosition > 0 ? this.clock.getElapsedTime() : 0

        this.printObjects(scene);

        if (this.delta > 0.1) {

            this.delta = 0;
            if (this.currentPosition === this.agentPositions.length - 1) {
                this.selectedTool = null;
            } else if (this.currentPosition > 0) {
                this.currentPosition++;
            }
        }

        renderer.setSize(this.canvasWidth, this.canvasHeight);
        renderer.render(scene, camera);
	}

	printObjects(scene: THREE.Scene) {
		
        this.obstacles.forEach(o => this.printLine(o.a, o.b, scene));

		this.paths.forEach((p, i) => p.forEach(v => this.printPathPrediction(v.x * 10, v.y * 10, v.z * 10, this.materials[i], scene)));

		this.agentPositions[this.currentPosition].forEach((g, i) => {

	        const goal = new THREE.Mesh(this.ringGeometry, this.materials[i]);
	        goal.position.set(this.goals[i].x * 10, this.goals[i].y * 10, -5);
	        scene.add(goal);
	
			this.infos[i] = new Info();
	
	        g.forEach((a: THREE.Vector3, j) => {
	            
				const nextPosition = this.agentPositions[this.currentPosition + 1];
	
	            let nextAgentPosition: THREE.Vector3;
	            if (nextPosition && nextPosition[i]) {
	                nextAgentPosition = nextPosition[i][j];
	            } else {
		        	nextAgentPosition = a;
	            }
				
				this.printInfo(i, a, g.length, this.agentPositions[0][i][j], nextAgentPosition);
				
	            this.printAgent((a.x + (nextAgentPosition.x - a.x) * this.delta * 10) * 10, (a.y + (nextAgentPosition.y - a.y) * this.delta * 10) * 10, 0, this.materials[i], scene);
		    });
	    });

		this.printSelectedTool(scene);
	}
	
	printInfo(groupIndex: number, agentPosition: THREE.Vector3, numberOfAgents: number, currentAgentInitialPosition: THREE.Vector3, nextAgentPosition: THREE.Vector3) {
		this.infos[groupIndex].totalDistance += new THREE.Vector3(agentPosition.x, agentPosition.y, agentPosition.z).distanceTo(currentAgentInitialPosition);
		this.infos[groupIndex].averageDistance += agentPosition.distanceTo(currentAgentInitialPosition) / numberOfAgents;
		this.infos[groupIndex].currentSpeed += nextAgentPosition.distanceTo(agentPosition) / numberOfAgents;
							
		if (this.paths[groupIndex]) {
			this.infos[groupIndex].averageDivergence +=  Math.min(...this.paths[groupIndex].map(p => agentPosition.distanceTo(p) / numberOfAgents));
		}
	}

	printSelectedTool(scene: THREE.Scene) {
		
        switch (this.selectedTool) {
            case 'agent': {
				this.printAgent(this.mousePosition.x * 10, this.mousePosition.y * 10, this.mousePosition.z * 10, this.materials[this.groupIndex], scene);
                break;
            }
            case 'obstacle': {
                const point = new THREE.Mesh(this.sphereGeometry, this.obstacleMaterial);
                if (this.currentPoint.x < 0) {
                    point.position.set(this.mousePosition.x * 10, this.mousePosition.y * 10, this.mousePosition.z * 10);

                    scene.add(point);
                } else {
                    this.printLine(this.currentPoint, this.mousePosition, scene);
                }
                break;
            }
			case 'prediction': {
				this.printPathPrediction(this.mousePosition.x * 10, this.mousePosition.y * 10, this.mousePosition.z * 10, this.materials[this.groupIndex], scene);

				if (this.clicking) {

					if (!this.paths[this.groupIndex]) {
						this.paths[this.groupIndex] = [];
					}
					
					if (this.paths.flat().filter(a => a.x == this.mousePosition.x && a.y == this.mousePosition.y).length === 0) {
						this.paths[this.groupIndex].push(new THREE.Vector3(this.mousePosition.x, this.mousePosition.y, 0));
					}
				}
			}
        }	
	}

	printAgent(x: number, y: number, z: number, material: THREE.Material, scene: THREE.Scene) {
		const agent = new THREE.Mesh(this.sphereGeometry, material);
        agent.position.set(x, y, z);
        
        scene.add(agent);
	}
	
	printPathPrediction(x: number, y: number, z: number, material: THREE.Material, scene: THREE.Scene) {
		const geometry = new THREE.BoxGeometry(6, 6, 1);
        const point = new THREE.Mesh(geometry, material);
        point.position.set(x, y, z);
		point.rotation.set(0, 0, 1.5707 / 2);

        scene.add(point);
	}

    printLine(a: THREE.Vector3, b: THREE.Vector3, scene: THREE.Scene) {

        for (let i = -5; i < 5; i++) {
            const pointsX = [];
            const pointsY = [];
            pointsX.push( new THREE.Vector3(a.x * 10, a.y * 10 + i, -10 ) );
            pointsX.push( new THREE.Vector3(b.x * 10, b.y * 10 + i, -10 ) );
            pointsY.push( new THREE.Vector3(a.x * 10 + i, a.y * 10, -10 ) );
            pointsY.push( new THREE.Vector3(b.x * 10 + i, b.y * 10, -10 ) );

            const geometryX = new THREE.BufferGeometry().setFromPoints( pointsX );
            const lineX = new THREE.Line( geometryX, this.obstacleMaterial );

            const geometryY = new THREE.BufferGeometry().setFromPoints( pointsY );
            const lineY = new THREE.Line( geometryY, this.obstacleMaterial );

            scene.add(lineX);
            scene.add(lineY);
        }
    }

    addObject() {
        this.dirty = true;
		
        switch (this.selectedTool) {
			case 'agent': {
				
	         	if (this.agentPositions[0].map(g => g.filter(a => a.x === this.mousePosition.x && a.y === this.mousePosition.y))
										  .reduce((accumulator, value) => accumulator.concat(value), []).length === 0) {
	            	this.agentPositions[0][this.groupIndex].push(this.mousePosition);
				}
			}
			case 'goal': {
            	this.goals[this.groupIndex] = this.mousePosition;
        	} 
			case 'removal': {
	            this.agentPositions[0] = this.agentPositions[0].map(g => g.filter(a => a.x !== this.mousePosition.x || a.y !== this.mousePosition.y));
	            this.obstacles = this.obstacles.filter(o => Math.abs(o.a.distanceTo(this.mousePosition) + this.mousePosition.distanceTo(o.b) - o.a.distanceTo(o.b)) > 0.05);
				
				this.paths.forEach((p, i) => p.filter(v => v.x === this.mousePosition.x && v.y === this.mousePosition.y).forEach(_v => this.paths[i] = []));
        	} 
			case 'obstacle': {
	            if (this.currentPoint.x >= 0) {
	                this.obstacles.push({a: this.currentPoint, b: this.mousePosition});
	                this.currentPoint = new THREE.Vector3(-1, -1, -1);
	            } else {
	                this.currentPoint = this.mousePosition;
	            }
			}
        }
    }

    obtainMousePosition(event: MouseEvent) {

        let x = event.clientX;
        let y = event.clientY;

        return new THREE.Vector3(Math.round(x / 10), Math.round(y / 10), 0);
    }

    play() {
        this.selectedTool = null;
		this.clock = new THREE.Clock();
		this.clock.start();
        if (this.dirty) {
	
			this.responseTime = 0;

            this.loading = true;
            const world: any = {};
            world.agentGroups = this.agentPositions[0].map((g, i) => {return {goal: this.goals[i], agentInitialPositions: g.map(a => new THREE.Vector3(a.x, a.y, a.z))}});
            world.obstacles = this.obstacles;
            world.dimensions = new THREE.Vector3(1000, 1000, 1000);

            this.bioCrowdsService.simulate(world, 200, this.randomPaths ? 100 : 0).subscribe(
                                                        res => {
                                                            this.agentPositions = res.positions.map(p => p.map(g => g.map(a => new THREE.Vector3(a.x, a.y, a.z))));
                                                            this.currentPosition = 1;
                                                            this.loading = false;
                                                            this.dirty = false;
                                                            this.delta = 0;
															this.responseTime = this.clock.getElapsedTime();
                                                        },
                                                        error => {
                                                            alert(error.error.message);
                                                            this.loading = false;
                                                        });
        } else {
            this.currentPosition = 1;
        }
    }

    addGroup() {
        if (this.agentPositions[0].length < 5) {
            this.agentPositions[0].push([]);
            this.goals.push(new THREE.Vector3(Math.round(Math.random() * (100) + 10), Math.round(Math.random() * (100) + 10), 0));
        }
    }

    save() {

        this.loading = true;
        const world: any = {};
        world.agentGroups = this.agentPositions[0].map((g, i) => {return {goal: this.goals[i], agentInitialPositions: g.map(a => new THREE.Vector3(a.x, a.y, a.z))}});
        world.obstacles = this.obstacles;
        world.dimensions = new THREE.Vector3(1000, 1000, 1000);

        this.bioCrowdsService.save(world).subscribe(res => {
                                                        this.currentPosition = 0;
                                                        this.loading = false;
                                                        this.dirty = false;
                                                        this.delta = 0;
                                                        this.location.replaceState(this.baseHref + res.headers.get('location').split('/').slice(-1)[0]);
                                                    },
                                                    error => {
                                                        alert(error.error.message);
                                                        this.loading = false;
                                                    });
    }

    handleChange(event: Event, index: number) {
        const element = event.target as HTMLInputElement;
        this.selectedTool = element.value;
        this.currentPosition = 0;
        this.groupIndex = index;
    }

    changeOptions() {
        this.dirty = true;
        this.currentPosition = 0;
    }
}
