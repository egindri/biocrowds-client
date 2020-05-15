import {Component, ViewChild, ElementRef, AfterViewInit, HostListener} from '@angular/core';
import * as THREE from 'three';
import { BioCrowdsService } from '../shared/biocrowds/biocrowds.service';
import { Tool } from './tool';

@Component({
    selector: 'app-biocrowds',
    templateUrl: './biocrowds.component.html',
    styleUrls: ['./biocrowds.component.css']
})
export class BioCrowdsComponent implements AfterViewInit {

    @ViewChild('container') container: ElementRef;

    canvasWidth: number;
    canvasHeight: number;

    agentPositions: THREE.Vector3[][] = [[new THREE.Vector3(40, 20, 0), new THREE.Vector3(50, 20, 0)]];
    goal: THREE.Vector3;

    orthographicCamera = true;
    playing = false;
    dirty = true;
    loading = false;

    currentPosition = 0;
    delta = 0;
    fps = 20;

    selectedTool: string;
    mousePosition = new THREE.Vector3(0, 0, 0);

    constructor(private bioCrowdsService: BioCrowdsService) {}

    ngAfterViewInit() {

        this.goal = new THREE.Vector3(80, 50, 0);

        const renderer = new THREE.WebGLRenderer();

        this.container.nativeElement.appendChild(renderer.domElement);

        const material = new THREE.MeshBasicMaterial({color: 0xaa7aff});
        const goalMaterial = new THREE.MeshBasicMaterial({color: 0x2196F3});
        const agentGeometry = new THREE.SphereGeometry(5);

        const clock = new THREE.Clock();
        const animate = () => {
            requestAnimationFrame(animate);

            this.delta += this.currentPosition > 0 ? clock.getDelta() : 0;

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

            this.agentPositions[this.currentPosition].forEach((a, i) => {

                const nextPosition = this.agentPositions[this.currentPosition + 1];

                let nextAgentPosition: THREE.Vector3;
                if (nextPosition) {
                    nextAgentPosition = nextPosition[i];
                }

                if (!nextAgentPosition) {
                    nextAgentPosition = a;
                }
                const agent = new THREE.Mesh(agentGeometry, material);
                agent.position.set((a.x + (nextAgentPosition.x - a.x) * this.delta * 20) * 10, (a.y + (nextAgentPosition.y - a.y) * this.delta * 20) * 10, a.z * nextAgentPosition.z * this.delta * 0.5);
                scene.add(agent);
            });

            if (this.delta > 0.05) {

                this.delta = 0;
                if (this.currentPosition === this.agentPositions.length - 1) {
                    this.selectedTool = null;
                } else if (this.currentPosition > 0) {
                    this.currentPosition++;
                }
            }

            const geometry = new THREE.BoxGeometry(30, 30, 1);
            const goal = new THREE.Mesh(geometry, goalMaterial);
            goal.position.set(this.goal.x * 10, this.goal.y * 10, -5);
            goal.rotation.set(0, 0, 1.5707 / 2);
            scene.add(goal)

            switch (this.selectedTool) {
                case 'agent': {
                    const agent = new THREE.Mesh(agentGeometry, material);
                    agent.position.set(this.mousePosition.x * 10, this.mousePosition.y * 10, this.mousePosition.z * 10);

                    scene.add(agent);
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

    addObject() {
        this.dirty = true;
        if (this.selectedTool === 'agent') {
            if (this.agentPositions[0].filter(a => a.x === this.mousePosition.x && a.y === this.mousePosition.y).length === 0) {
                this.agentPositions[0].push(this.mousePosition);
            }
        } else if (this.selectedTool === 'goal') {
            this.goal = this.mousePosition;
        } else if (this.selectedTool === 'removal') {
            this.agentPositions[0] = this.agentPositions[0].filter(a => a.x !== this.mousePosition.x || a.y !== this.mousePosition.y);
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
        if (this.dirty) {

            this.loading = true;
            const world: any = {};
            world.agentInitialPositions = this.agentPositions[0].map(a => new THREE.Vector3(a.x, a.y, a.z));
            world.dimensions = new THREE.Vector3(1000, 1000, 1000);
            world.goal = this.goal;

            this.bioCrowdsService.simulate(world, 200).subscribe(
                                                        res => {
                                                            this.agentPositions = res.positions;
                                                            this.currentPosition = 1;
                                                            this.loading = false;
                                                            this.dirty = false;
                                                            this.delta = 0;
                                                        },
                                                        error => {
                                                            alert(error.error.message);
                                                            this.loading = false;
                                                        });
        } else {
            this.currentPosition = 1;
        }
    }

    pause() {

    }

    handleChange(event: Event) {
        const element = event.target as HTMLInputElement;
        //this.selectedTool = element.value as unknown as Tool;
        this.selectedTool = element.value;
        this.currentPosition = 0;
    }
}
