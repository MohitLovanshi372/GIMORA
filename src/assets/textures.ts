/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generators for Cyberpunk Neon City
 */

// 1. High-Fidelity Procedural Window Grid Canvas
export function createProceduralWindowTexture(
  districtTint: string = '#00f0ff',
  cols = 8,
  rows = 32
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep architectural dark facade backing
  ctx.fillStyle = '#060a14';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const padX = 10;
  const padY = 8;
  const winW = (canvas.width - padX * (cols + 1)) / cols;
  const winH = (canvas.height - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    // Some entire floor zones are conference floors or night-shift server floors
    const floorType = Math.random();

    for (let c = 0; c < cols; c++) {
      const rand = Math.random();
      const wx = padX + c * (winW + padX);
      const wy = padY + r * (winH + padY);

      // Window frame sill
      ctx.fillStyle = '#0b1324';
      ctx.fillRect(wx - 1, wy - 1, winW + 2, winH + 2);

      // 45% of windows lit (realistic metropolitan night occupancy)
      if (rand > 0.45) {
        let colorHex = '#e2e8f0';
        const variation = Math.random();

        if (floorType > 0.85 || variation > 0.75) {
          colorHex = districtTint; // District primary neon glow
        } else if (variation > 0.45) {
          colorHex = '#fbbf24'; // Warm amber residential / late-night lamp
        } else if (variation > 0.25) {
          colorHex = '#38bdf8'; // High-tech cyan-blue workspace
        } else {
          colorHex = '#f8fafc'; // Crisp bright fluorescent office
        }

        // Variable luminosity per window
        const brightness = 0.55 + Math.random() * 0.45;
        ctx.globalAlpha = brightness;
        ctx.fillStyle = colorHex;
        ctx.fillRect(wx, wy, winW, winH);

        // Window blind / horizontal louver detail on 30% of lit windows
        if (Math.random() > 0.7) {
          ctx.fillStyle = 'rgba(10, 15, 26, 0.4)';
          const louverCount = 3;
          const louverH = winH / (louverCount * 2);
          for (let l = 0; l < louverCount; l++) {
            ctx.fillRect(wx, wy + l * louverH * 2, winW, louverH);
          }
        }
        ctx.globalAlpha = 1.0;
      } else {
        // Dark unlit window with faint interior reflection
        ctx.fillStyle = '#0a101f';
        ctx.fillRect(wx, wy, winW, winH);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  return texture;
}

// 2. Server Racks and Lab Interior Texture (for glowing interiors visible through glass)
export function createServerRacksTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, 256, 256);

  // Server rack columns
  for (let x = 16; x < 256; x += 48) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, 8, 36, 240);

    // Blinking LEDs
    for (let y = 16; y < 240; y += 12) {
      ctx.fillStyle = Math.random() > 0.3 ? '#00f0ff' : '#10b981';
      ctx.fillRect(x + 6, y, 6, 4);
      ctx.fillStyle = Math.random() > 0.4 ? '#3b82f6' : '#a855f7';
      ctx.fillRect(x + 16, y, 12, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. Digital Billboard Generator
export function createDigitalBillboardTexture(
  title: string,
  subtitle: string,
  primaryColor: string,
  accentColor: string
): { texture: THREE.CanvasTexture; update: (time: number) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);

  const update = (time: number) => {
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing border frame
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Scanline effect
    const scanlineY = (time * 90) % canvas.height;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(0, scanlineY, canvas.width, 24);

    // Title
    ctx.font = 'bold 42px "Chakra Petch", monospace';
    ctx.fillStyle = primaryColor;
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 95);

    // Subtitle with flicker
    const flicker = Math.sin(time * 10) > 0.85 ? 0.5 : 1.0;
    ctx.globalAlpha = flicker;
    ctx.font = '24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(subtitle, canvas.width / 2, 160);
    ctx.globalAlpha = 1.0;

    // Glowing footer accent
    ctx.fillStyle = primaryColor;
    ctx.fillRect(32, 195, canvas.width - 64, 6);

    texture.needsUpdate = true;
  };

  return { texture, update };
}

// 4. Realistic Asphalt Noise Texture
export function createRealisticAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 512, 512);

  // Fine noise grain for asphalt texture
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 22;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain + 2));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(16, 16);
  return tex;
}

// 5. Soft Radial Falloff Light Pool Decal for Street Lamps
export function createLightPoolDecalTexture(colorHex: string = '#00f0ff'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, colorHex);
  gradient.addColorStop(0.35, colorHex);
  gradient.addColorStop(0.7, 'rgba(0, 240, 255, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// 6. Road Directional Arrow Decal (Straight & Turn Arrows)
export function createRoadArrowTexture(type: 'straight' | 'left' | 'right' = 'straight'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 256);
  ctx.fillStyle = '#e2e8f0';

  if (type === 'straight') {
    // Shaft
    ctx.fillRect(54, 110, 20, 120);
    // Arrow Head
    ctx.beginPath();
    ctx.moveTo(64, 30);
    ctx.lineTo(105, 120);
    ctx.lineTo(76, 120);
    ctx.lineTo(76, 230);
    ctx.lineTo(52, 230);
    ctx.lineTo(52, 120);
    ctx.lineTo(23, 120);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'left') {
    ctx.beginPath();
    ctx.moveTo(25, 90);
    ctx.lineTo(70, 45);
    ctx.lineTo(70, 75);
    ctx.lineTo(85, 75);
    ctx.arcTo(105, 95, 105, 140, 20);
    ctx.lineTo(105, 220);
    ctx.lineTo(85, 220);
    ctx.lineTo(85, 140);
    ctx.lineTo(70, 140);
    ctx.lineTo(70, 135);
    ctx.closePath();
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// 7. High-Precision Asphalt Normal Map (Micro-gravel aggregate & puddle depression smoothing)
export function createProceduralAsphaltNormalMap(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const height = new Float32Array(size * size);

  // Base fine grit noise
  for (let i = 0; i < size * size; i++) {
    height[i] = (Math.random() - 0.5) * 0.12;
  }

  // Crushed aggregate pebbles
  const pebbleCount = 650;
  for (let p = 0; p < pebbleCount; p++) {
    const px = Math.floor(Math.random() * size);
    const py = Math.floor(Math.random() * size);
    const r = 1 + Math.floor(Math.random() * 3);
    const h = 0.18 + Math.random() * 0.28;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const d2 = dx * dx + dy * dy;
        if (d2 <= r * r) {
          const x = (px + dx + size) % size;
          const y = (py + dy + size) % size;
          height[y * size + x] += h * (1.0 - Math.sqrt(d2) / r);
        }
      }
    }
  }

  // Flattened wet puddle depressions
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 4;
      const ny = (y / size) * Math.PI * 4;
      const puddleVal = Math.sin(nx) * Math.cos(ny) + Math.sin(nx * 2 + 1) * 0.5;
      if (puddleVal > 0.55) {
        const damp = Math.min(1.0, (puddleVal - 0.55) * 3.5);
        height[y * size + x] *= 1.0 - damp * 0.85;
      }
    }
  }

  // Tangent-space Sobel normals
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 3.6;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const dzdx = (height[y * size + xNext] - height[y * size + xPrev]) * strength;
      const dzdy = (height[yNext * size + x] - height[yPrev * size + x]) * strength;

      const len = Math.hypot(-dzdx, -dzdy, 1.0);
      const nx = -dzdx / len;
      const ny = -dzdy / len;
      const nz = 1.0 / len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

// 8. Procedural Asphalt Roughness Map (Glistening wet spots & puddle reflection zones)
export function createProceduralAsphaltRoughnessMap(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x / size) * Math.PI * 4;
      const ny = (y / size) * Math.PI * 4;
      const puddleVal = Math.sin(nx) * Math.cos(ny) + Math.sin(nx * 2 + 1) * 0.5;

      let rVal = 0.70 + (Math.random() - 0.5) * 0.14;
      if (puddleVal > 0.5) {
        const puddleStrength = Math.min(1.0, (puddleVal - 0.5) * 3.2);
        rVal = rVal * (1.0 - puddleStrength) + 0.08 * puddleStrength;
      }

      const byte = Math.floor(Math.min(1.0, Math.max(0.0, rVal)) * 255);
      const idx = (y * size + x) * 4;
      data[idx] = byte;
      data[idx + 1] = byte;
      data[idx + 2] = byte;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

// 9. Concrete Normal Map (Fine aggregate, formwork seams, micro-porosity)
export function createProceduralConcreteNormalMap(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const height = new Float32Array(size * size);

  // Concrete grit
  for (let i = 0; i < size * size; i++) {
    height[i] = (Math.random() - 0.5) * 0.07;
  }

  // Micro-voids
  for (let p = 0; p < 350; p++) {
    const px = Math.floor(Math.random() * size);
    const py = Math.floor(Math.random() * size);
    height[py * size + px] -= 0.12 + Math.random() * 0.18;
  }

  // Formwork / expansion joints
  const seamSpacing = 64;
  for (let y = 0; y < size; y++) {
    const isYSeam = Math.abs((y % seamSpacing) - seamSpacing / 2) < 2;
    for (let x = 0; x < size; x++) {
      const isXSeam = Math.abs((x % seamSpacing) - seamSpacing / 2) < 2;
      if (isYSeam || isXSeam) {
        height[y * size + x] -= 0.22;
      }
    }
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 2.6;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const dzdx = (height[y * size + xNext] - height[y * size + xPrev]) * strength;
      const dzdy = (height[yNext * size + x] - height[yPrev * size + x]) * strength;

      const len = Math.hypot(-dzdx, -dzdy, 1.0);
      const nx = -dzdx / len;
      const ny = -dzdy / len;
      const nz = 1.0 / len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

// 10. Concrete Roughness Map
export function createProceduralConcreteRoughnessMap(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const coarse = Math.sin((x / size) * Math.PI * 6) * Math.cos((y / size) * Math.PI * 6) * 0.08;
      const grit = (Math.random() - 0.5) * 0.06;
      const r = Math.min(1.0, Math.max(0.0, 0.74 + coarse + grit));
      const byte = Math.floor(r * 255);
      const idx = (y * size + x) * 4;
      data[idx] = byte;
      data[idx + 1] = byte;
      data[idx + 2] = byte;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

// 11. Architectural Float Glass Normal Map (Curtain-wall pillowing & optical surface distortion)
export function createProceduralGlassNormalMap(cols = 4, rows = 8): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const height = new Float32Array(size * size);
  const panelW = size / cols;
  const panelH = size / rows;

  for (let y = 0; y < size; y++) {
    const py = (y % panelH) / panelH;
    const curveY = Math.sin(py * Math.PI) * 0.12;

    for (let x = 0; x < size; x++) {
      const px = (x % panelW) / panelW;
      const curveX = Math.sin(px * Math.PI) * 0.12;

      let h = curveX * curveY;

      // Silicone joint indent
      const edgeDist = Math.min(px, 1.0 - px, py, 1.0 - py);
      if (edgeDist < 0.05) {
        h -= (0.05 - edgeDist) * 2.5;
      }

      // Micro float waviness
      h += Math.sin((x / size) * Math.PI * 14) * 0.012;

      height[y * size + x] = h;
    }
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 1.7;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const dzdx = (height[y * size + xNext] - height[y * size + xPrev]) * strength;
      const dzdy = (height[yNext * size + x] - height[yPrev * size + x]) * strength;

      const len = Math.hypot(-dzdx, -dzdy, 1.0);
      const nx = -dzdx / len;
      const ny = -dzdy / len;
      const nz = 1.0 / len;

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

// 12. Building Facade Normal Map (Protruding mullions & recessed glass panes)
export function createProceduralFacadeNormalMap(cols = 8, rows = 32): THREE.CanvasTexture {
  const width = 256;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const hField = new Float32Array(width * height);
  const padX = 5;
  const padY = 4;
  const winW = (width - padX * (cols + 1)) / cols;
  const winH = (height - padY * (rows + 1)) / rows;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      hField[y * width + x] = 0.35; // structural mullion level
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = Math.floor(padX + c * (winW + padX));
      const wy = Math.floor(padY + r * (winH + padY));
      const wSpan = Math.floor(winW);
      const hSpan = Math.floor(winH);

      for (let dy = 0; dy < hSpan; dy++) {
        const y = wy + dy;
        if (y >= height) continue;
        const fy = dy / hSpan;
        for (let dx = 0; dx < wSpan; dx++) {
          const x = wx + dx;
          if (x >= width) continue;
          const fx = dx / wSpan;

          const edge = Math.min(fx, 1 - fx, fy, 1 - fy);
          const bevel = Math.min(1.0, edge * 8.0);
          hField[y * width + x] = bevel * 0.05;
        }
      }
    }
  }

  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  const strength = 2.8;

  for (let y = 0; y < height; y++) {
    const yPrev = (y - 1 + height) % height;
    const yNext = (y + 1) % height;
    for (let x = 0; x < width; x++) {
      const xPrev = (x - 1 + width) % width;
      const xNext = (x + 1) % width;

      const dzdx = (hField[y * width + xNext] - hField[y * width + xPrev]) * strength;
      const dzdy = (hField[yNext * width + x] - hField[yPrev * width + x]) * strength;

      const len = Math.hypot(-dzdx, -dzdy, 1.0);
      const nx = -dzdx / len;
      const ny = -dzdy / len;
      const nz = 1.0 / len;

      const idx = (y * width + x) * 4;
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.generateMipmaps = true;
  return tex;
}

