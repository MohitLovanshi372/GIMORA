import * as THREE from 'three';
import { CityPhysicsEngine } from './modules/CityPhysicsEngine';

/** Lightweight arcade vehicle physics for the optional imported Zenvo GLB.
 * I/K accelerate/reverse, J/L steer, Space brake. Independent of player WASD.
 */
export class ShowcaseCarPhysics {
  private speed = 0;
  private steering = 0;
  private keys = new Set<string>();
  private onDown = (e: KeyboardEvent) => {
    if (['KeyI','KeyJ','KeyK','KeyL','Space'].includes(e.code)) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      this.keys.add(e.code);
      if (e.code === 'Space') e.preventDefault();
    }
  };
  private onUp = (e: KeyboardEvent) => { this.keys.delete(e.code); };
  constructor(private model: THREE.Object3D, private collisions: CityPhysicsEngine) {
    window.addEventListener('keydown', this.onDown);
    window.addEventListener('keyup', this.onUp);
  }
  update(delta: number) {
    const dt = Math.min(Math.max(delta, 0), 0.05);
    const throttle = Number(this.keys.has('KeyI')) - Number(this.keys.has('KeyK'));
    const turn = Number(this.keys.has('KeyJ')) - Number(this.keys.has('KeyL'));
    const braking = this.keys.has('Space');

    if (braking) {
      this.speed = THREE.MathUtils.damp(this.speed, 0, 12, dt);
    } else if (throttle !== 0) {
      this.speed = THREE.MathUtils.clamp(this.speed + throttle * 8 * dt, -9, 23);
    } else {
      this.speed = THREE.MathUtils.damp(this.speed, 0, 1.8, dt);
    }

    this.steering = THREE.MathUtils.damp(this.steering, turn, 7, dt);
    if (Math.abs(this.speed) < 0.03) { this.speed = 0; return; }
    // Kinematic bicycle approximation: steer response reduces at very low speeds.
    const yaw = this.steering * (this.speed / 4.5) * Math.tan(0.48) * dt;
    const newHeading = this.model.rotation.y + yaw;
    const x = this.model.position.x + Math.sin(newHeading) * this.speed * dt;
    const z = this.model.position.z + Math.cos(newHeading) * this.speed * dt;
    if (this.collisions.checkCollisionAt(x, z, this.model.position.y + 1, 1.1)) {
      this.speed = 0;
      return;
    }
    this.model.rotation.y = newHeading;
    this.model.position.x = x;
    this.model.position.z = z;
  }
  dispose() {
    window.removeEventListener('keydown', this.onDown);
    window.removeEventListener('keyup', this.onUp);
    this.keys.clear();
  }
}
