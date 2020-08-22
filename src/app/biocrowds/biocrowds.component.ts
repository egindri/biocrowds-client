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

    canvasWidth: number;
    canvasHeight: number;

    agentPositions = [[[new THREE.Vector3(40, 20, 0), new THREE.Vector3(50, 20, 0)]]];
    goals: [THREE.Vector3] = [new THREE.Vector3(80, 50, 0)];
    obstacles: any[] = [{a: new THREE.Vector3(50, 50, 0), b: new THREE.Vector3(60, 60, 0)}];
	infos: Info[] = [];

    orthographicCamera = true;
    playing = false;
    dirty = true;
    loading = false;

    currentPosition = 0;
    delta = 0;
    fps = 20;

	responseTime = 0;

	clock = new THREE.Clock();

    groupIndex = 0;

    selectedTool: string;
    mousePosition = new THREE.Vector3(0, 0, 0);

    randomPaths = false;

    currentPoint = new THREE.Vector3(-1, -1, -1);

    obstacleMaterial = new THREE.MeshBasicMaterial({color: 0xff9038});

    constructor(private bioCrowdsService: BioCrowdsService, private location: Location, @Inject(APP_BASE_HREF) public baseHref: string) {}

    ngAfterViewInit() {

        const id = window.location.pathname.replace(this.baseHref, '');

        if (id) {
            console.log('yeppers')
            this.bioCrowdsService.find(id).subscribe(
                                                    res => {
                                                        console.log(res)
                                                        this.frames[0] = res.agentGroups.map(ag => ag.agentInitialPositions);
                                                        this.goals = res.agentGroups.map(ag => ag.goal);
                                                        this.obstacles = res.obstacles;
                                                    },
                                                    error => {

                                                    }
            )
        }

        const renderer = new THREE.WebGLRenderer();

        const materials = [new THREE.MeshBasicMaterial({color: 0xaa7aff}),
                           new THREE.MeshBasicMaterial({color: 0xff73e1}),
                           new THREE.MeshBasicMaterial({color: 0x45f0e0}),
                           new THREE.MeshBasicMaterial({color: 0xabf475}),
                           new THREE.MeshBasicMaterial({color: 0x78a1ff})];

        this.container.nativeElement.appendChild(renderer.domElement);

        const sphereGeometry = new THREE.SphereGeometry(5);

        const animate = () => {
            requestAnimationFrame(animate);

            this.delta += this.currentPosition > 0 ? this.clock.getDelta() : 0;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xEEEEEE);

            this.canvasWidth = window.innerWidth;
            this.canvasHeight = window.innerHeight;

            let camera: THREE.Camera;
            if (this.orthographicCamera) {
                camera = new THREE.OrthographicCamera(this.container.nativeElement.offsetLeft,
                                                      this.container.nativeElement.offsetLeft + this.canvasWidth,
                                                      this.container.nativeElement.offsetTop,
                                                      this.container.nativeElement.offsetTop + this.canvasHeight,
                                                      -10, 10);
            } else {
                camera = new THREE.PerspectiveCamera(75, this.canvasWidth / this.canvasHeight, 0.1, 1000);
                camera.position.z = 15;
            }

            this.obstacles.forEach(o => this.printLine(o.a, o.b, scene));

            this.frames[this.currentPosition].forEach((g, i) => {

                const geometry = new THREE.BoxGeometry(30, 30, 1);
                const goal = new THREE.Mesh(geometry, materials[i]);
                goal.position.set(this.goals[i].x * 10, this.goals[i].y * 10, -5);
                goal.rotation.set(0, 0, 1.5707 / 2);
                scene.add(goal);

				this.infos[i] = new Info();
				this.infos[i].currentSpeed = 0;
				this.infos[i].averageSpeed = 0;
				this.infos[i].totalDistance = 0;
				this.infos[i].averageDistance = 0;

                g.forEach((a, j) => {
                    
					const nextPosition = this.agentPositions[this.currentPosition + 1];

                    let nextAgentPosition: THREE.Vector3;
                    if (nextPosition && nextPosition[i]) {
                        nextAgentPosition = nextPosition[i][j];
                    }

                    if (!nextAgentPosition) {
                        nextAgentPosition = a;
                    }
					
					this.infos[i].totalDistance += Math.sqrt(Math.pow(a.x - this.agentPositions[0][i][j].x, 2)
										+ Math.pow(a.y - this.agentPositions[0][i][j].y, 2) 
										+ Math.pow(a.z - this.agentPositions[0][i][j].z, 2));
					
					this.infos[i].averageDistance += Math.sqrt(Math.pow(a.x - this.agentPositions[0][i][j].x, 2)
										+ Math.pow(a.y - this.agentPositions[0][i][j].y, 2) 
										+ Math.pow(a.z - this.agentPositions[0][i][j].z, 2))/ g.length;
										
					this.infos[i].currentSpeed += Math.sqrt(Math.pow((nextAgentPosition.x - a.x) / g.length, 2)
										+ Math.pow((nextAgentPosition.y - a.y) / g.length, 2) 
										+ Math.pow((nextAgentPosition.z - a.z) / g.length, 2));
										
					this.infos[i].averageSpeed += Math.sqrt(Math.pow((a.x - this.agentPositions[0][i][j].x) / g.length, 2)
										+ Math.pow((a.y - this.agentPositions[0][i][j].y) / g.length, 2) 
										+ Math.pow((a.z - this.agentPositions[0][i][j].z) / g.length, 2));
					
                    const agent = new THREE.Mesh(sphereGeometry, materials[i]);
                    agent.position.set((a.x + (nextAgentPosition.x - a.x) * this.delta * 10) * 10, (a.y + (nextAgentPosition.y - a.y) * this.delta * 10) * 10, a.z * nextAgentPosition.z * this.delta * 20);
                    
                    scene.add(agent);
            	});
			});

            if (this.delta > 0.1) {

                this.delta = 0;
                if (this.currentPosition === this.frames.length - 1) {
                    this.selectedTool = null;
                } else if (this.currentPosition > 0) {
                    this.currentPosition++;
                }
            }

            switch (this.selectedTool) {
                case 'agent': {
                    const agent = new THREE.Mesh(sphereGeometry, materials[this.groupIndex]);
                    agent.position.set(this.mousePosition.x * 10, this.mousePosition.y * 10, this.mousePosition.z * 10);

                    scene.add(agent);
                    break;
                }
                case 'obstacle': {
                    const point = new THREE.Mesh(sphereGeometry, this.obstacleMaterial);
                    if (this.currentPoint.x < 0) {
                        point.position.set(this.mousePosition.x * 10, this.mousePosition.y * 10, this.mousePosition.z * 10);

                        scene.add(point);
                    } else {
                        this.printLine(this.currentPoint, this.mousePosition, scene);
                    }
                    break;

                }
                default: {

                }
            }

            renderer.setSize(this.canvasWidth, this.canvasHeight);
            renderer.render(scene, camera);
        };

        animate();
    }

    @HostListener('document:mousemove', ['$event'])
    onMouseMove(event: MouseEvent) {
        this.mousePosition = this.obtainMousePosition(event);
    }

    printLine(a: THREE.Vector3, b: THREE.Vector3, scene: THREE.Scene) {

        for (let i = -5; i < 5; i++) {
            const pointsX = [];
            const pointsY = [];
            const x = Math.abs(this.currentPoint.x - this.mousePosition.x);
            const y = Math.abs(this.currentPoint.y - this.mousePosition.y);
            pointsX.push( new THREE.Vector3(a.x * 10, a.y * 10+i, -10 ) );
            pointsX.push( new THREE.Vector3(b.x * 10, b.y * 10+i, -10 ) );
            pointsY.push( new THREE.Vector3(a.x * 10 + i, a.y * 10, -10 ) );
            pointsY.push( new THREE.Vector3(b.x * 10 + i, b.y * 10, -10 ) );

            const geometryX = new THREE.BufferGeometry().setFromPoints( pointsX );
            const lineX = new THREE.Line( geometryX, this.obstacleMaterial );

            const geometryY = new THREE.BufferGeometry().setFromPoints( pointsY );
            const lineY = new THREE.Line( geometryY, this.obstacleMaterial );

            scene.add( lineX );
            scene.add( lineY );
        }
    }

    addObject() {
        this.dirty = true;
        if (this.selectedTool === 'agent') {
            if (this.frames[0].map(g => g.filter(a => a.x === this.mousePosition.x && a.y === this.mousePosition.y)).reduce((accumulator, value) => accumulator.concat(value), []).length === 0) {
                this.frames[0][this.groupIndex].push(this.mousePosition);
            }
        } else if (this.selectedTool === 'goal') {
            this.goals[this.groupIndex] = this.mousePosition;
        } else if (this.selectedTool === 'removal') {
            this.frames[0] = this.frames[0].map(g => g.filter(a => a.x !== this.mousePosition.x || a.y !== this.mousePosition.y));
            this.obstacles = this.obstacles.filter(o => Math.abs(o.a.distanceTo(this.mousePosition) + this.mousePosition.distanceTo(o.b) - o.a.distanceTo(o.b)) > 0.05);
        } else if (this.selectedTool === 'obstacle') {
            if (this.currentPoint.x >= 0) {
                this.obstacles.push({a: this.currentPoint, b: this.mousePosition})
                this.currentPoint = new THREE.Vector3(-1, -1, -1);
            } else {
                this.currentPoint = this.mousePosition;
            }
        }
    }

    obtainMousePosition(event: MouseEvent) {
        let x: number;
        let y: number;

        if (this.orthographicCamera) {
            x = event.clientX;
            y = event.clientY;
        } else {
            x = ((event.clientX - this.container.nativeElement.offsetLeft) / this.canvasWidth) * 2 - 1;
            y = -((event.clientY - this.container.nativeElement.offsetTop) / this.canvasHeight) * 2 + 1;
        }

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
            world.agentGroups = this.frames[0].map((g, i) => {return {goal: this.goals[i], agentInitialPositions: g.map(a => new THREE.Vector3(a.x, a.y, a.z))}});
            world.obstacles = this.obstacles;
            world.dimensions = new THREE.Vector3(1000, 1000, 1000);

            this.bioCrowdsService.simulate(world, 200, this.randomPaths ? 100 : 0).subscribe(
                                                        res => {
                                                            this.frames = res.positions;
                                                            this.currentPosition = 1;
                                                            this.loading = false;
                                                            this.dirty = false;
                                                            this.delta = 0;
															this.responseTime = this.clock.getElapsedTime();
															console.log(this.clock.getElapsedTime());
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
        if (this.frames[0].length < 5) {
            this.frames[0].push([]);
            this.goals.push(new THREE.Vector3(Math.round(Math.random() * (100) + 10), Math.round(Math.random() * (100) + 10), 0));
        }
    }

    pause() {

    }

    save() {

        this.loading = true;
        const world: any = {};
        world.agentGroups = this.frames[0].map((g, i) => {return {goal: this.goals[i], agentInitialPositions: g.map(a => new THREE.Vector3(a.x, a.y, a.z))}});
        world.obstacles = this.obstacles;
        world.dimensions = new THREE.Vector3(1000, 1000, 1000);

        this.bioCrowdsService.save(world).subscribe(
                                                    res => {
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
        //this.selectedTool = element.value as unknown as Tool;
        this.selectedTool = element.value;
        this.currentPosition = 0;
        this.groupIndex = index;
    }

    changeOptions() {
        this.dirty = true;
        this.currentPosition = 0;
    }
}
