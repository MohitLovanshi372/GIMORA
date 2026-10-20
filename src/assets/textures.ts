/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

/**
 * Procedural Canvas Texture Generators for Realistic Metropolitan City
 */

export type FacadeStyle =
  | 'corporate-glass'
  | 'financial-granite'
  | 'modern-residential'
  | 'limestone-retail'
  | 'diagrid-steel'
  | 'art-deco-brass'
  | 'biophilic-terrace'
  | 'brutalist-concrete'
  | 'emerald-curtain'
  | 'rose-copper';

// 1. Ultra-High-Resolution 4K Procedural Realistic Building Facade & Interior Room Grid
export function createProceduralWindowTexture(
  facadeTone: string = '#1e293b',
  cols = 8,
  rows = 32,
  style: FacadeStyle = 'corporate-glass'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Base architectural facade cladding by style
  const styleDefaults: Record<FacadeStyle, string> = {
    'corporate-glass': '#0a2540',
    'financial-granite': '#78716c',
    'modern-residential': '#7c2d12',
    'limestone-retail': '#a8a29e',
    'diagrid-steel': '#0f2942',
    'art-deco-brass': '#1c1917',
    'biophilic-terrace': '#44403c',
    'brutalist-concrete': '#64748b',
    'emerald-curtain': '#064e3b',
    'rose-copper': '#78350f',
  };

  ctx.fillStyle = facadeTone || styleDefaults[style] || '#1e293b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Add realistic stone/concrete/masonry mineral grain & ashlar joints where appropriate
  if (
    style === 'financial-granite' ||
    style === 'limestone-retail' ||
    style === 'brutalist-concrete' ||
    style === 'modern-residential'
  ) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    for (let i = 0; i < 14000; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 10000; i++) {
      ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
  }

  const isWideStonePiers =
    style === 'financial-granite' ||
    style === 'limestone-retail' ||
    style === 'brutalist-concrete' ||
    style === 'art-deco-brass';
  const padX = isWideStonePiers ? 18 : style === 'modern-residential' ? 14 : 9;
  const padY = isWideStonePiers ? 18 : style === 'biophilic-terrace' ? 20 : 11;
  const winW = (canvas.width - padX * (cols + 1)) / cols;
  const winH = (canvas.height - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    const spandrelY = r * (winH + padY);
    const isMechanicalFloor = r === Math.floor(rows * 0.5);

    // Structural horizontal floor slab spandrel & architectural cornice/ledges
    if (style === 'art-deco-brass') {
      ctx.fillStyle = '#b45309';
      ctx.fillRect(0, spandrelY, canvas.width, padY);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(0, spandrelY + 3, canvas.width, 3);
    } else if (style === 'financial-granite' || style === 'limestone-retail') {
      ctx.fillStyle = style === 'limestone-retail' ? '#d6d3d1' : '#a8a29e';
      ctx.fillRect(0, spandrelY, canvas.width, padY);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, spandrelY + padY - 3, canvas.width, 3);
    } else if (style === 'biophilic-terrace') {
      // Warm architectural timber slab + lush green vertical foliage planter box!
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, spandrelY, canvas.width, padY * 0.45);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, spandrelY + padY * 0.45, canvas.width, padY * 0.55);
      ctx.fillStyle = '#22c55e';
      for (let gx = 0; gx < canvas.width; gx += 12) {
        ctx.fillRect(gx, spandrelY + padY * 0.48, 7, padY * 0.48);
      }
    } else if (style === 'rose-copper') {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, spandrelY, canvas.width, padY);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(0, spandrelY, canvas.width, 2);
    } else {
      ctx.fillStyle = style === 'emerald-curtain' ? '#065f46' : '#1e293b';
      ctx.fillRect(0, spandrelY, canvas.width, padY);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(0, spandrelY, canvas.width, 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, spandrelY + padY - 2, canvas.width, 2);
    }

    for (let c = 0; c < cols; c++) {
      const wx = padX + c * (winW + padX);
      const wy = padY + r * (winH + padY);

      // Window frame bevel (Gold brass for Art-Deco, Bronze for Granite/Copper, Silver for Curtain-Wall)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(wx - 2, wy - 2, winW + 4, winH + 4);
      ctx.strokeStyle =
        style === 'art-deco-brass'
          ? 'rgba(250, 204, 21, 0.7)'
          : style === 'rose-copper' || style === 'financial-granite'
          ? 'rgba(217, 119, 6, 0.55)'
          : 'rgba(148, 163, 184, 0.45)';
      ctx.lineWidth = isWideStonePiers ? 2.5 : 1.5;
      ctx.strokeRect(wx - 1, wy - 1, winW + 2, winH + 2);

      if (isMechanicalFloor) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(wx, wy, winW, winH);
        ctx.fillStyle = style === 'art-deco-brass' ? '#ca8a04' : '#334155';
        for (let ly = wy + 3; ly < wy + winH - 2; ly += 5) {
          ctx.fillRect(wx + 2, ly, winW - 4, 2);
        }
        continue;
      }

      const rand = Math.random();
      if (rand > 0.30) {
        // Illuminated interior room with depth gradient
        const variation = Math.random();
        let topColor = '#f8fafc';
        let bottomColor = '#cbd5e1';

        if (style === 'modern-residential' || style === 'biophilic-terrace' || style === 'art-deco-brass') {
          if (variation > 0.5) {
            topColor = '#fef3c7';
            bottomColor = '#d97706';
          } else if (variation > 0.2) {
            topColor = '#fde68a';
            bottomColor = '#b45309';
          } else {
            topColor = '#ffedd5';
            bottomColor = '#c2410c';
          }
        } else if (style === 'emerald-curtain' || style === 'diagrid-steel') {
          topColor = variation > 0.45 ? '#ecfdf5' : '#e0f2fe';
          bottomColor = variation > 0.45 ? '#059669' : '#0284c7';
        } else {
          if (variation > 0.55) {
            topColor = '#fef9c3';
            bottomColor = '#94a3b8';
          } else if (variation > 0.25) {
            topColor = '#f8fafc';
            bottomColor = '#64748b';
          } else {
            topColor = '#e0f2fe';
            bottomColor = '#38bdf8';
          }
        }

        const roomGrad = ctx.createLinearGradient(wx, wy, wx, wy + winH);
        roomGrad.addColorStop(0, topColor);
        roomGrad.addColorStop(1, bottomColor);
        ctx.globalAlpha = 0.76 + Math.random() * 0.24;
        ctx.fillStyle = roomGrad;
        ctx.fillRect(wx, wy, winW, winH);

        // Recessed ceiling LED light troffer strip inside room
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx + winW * 0.15, wy + 3, winW * 0.7, 3);

        // Interior office furniture / workstation silhouette at lower pane
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(wx + winW * 0.1, wy + winH * 0.68, winW * 0.8, winH * 0.32);

        // Arched stone top lintel for Beaux-Arts limestone style
        if (style === 'limestone-retail') {
          ctx.fillStyle = '#d6d3d1';
          ctx.fillRect(wx, wy, winW, 5);
        }

        ctx.globalAlpha = 1.0;
      } else {
        // Unlit daytime reflective architectural glass pane (distinct tint per architectural style!)
        const skyGrad = ctx.createLinearGradient(wx, wy, wx + winW, wy + winH);
        if (style === 'emerald-curtain') {
          skyGrad.addColorStop(0, '#065f46');
          skyGrad.addColorStop(1, '#022c22');
        } else if (style === 'corporate-glass' || style === 'diagrid-steel') {
          skyGrad.addColorStop(0, '#1d4ed8');
          skyGrad.addColorStop(0.5, '#0f2942');
          skyGrad.addColorStop(1, '#172554');
        } else if (style === 'rose-copper' || style === 'art-deco-brass') {
          skyGrad.addColorStop(0, '#451a03');
          skyGrad.addColorStop(1, '#1c1917');
        } else {
          skyGrad.addColorStop(0, '#334155');
          skyGrad.addColorStop(1, '#0f172a');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(wx, wy, winW, winH);
      }

      // Balcony glass railing & warm wood soffit on residential & biophilic facades
      if (style === 'modern-residential' || style === 'biophilic-terrace') {
        ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
        ctx.fillRect(wx, wy + winH * 0.70, winW, 3.5);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(wx, wy + winH * 0.74, winW, winH * 0.26);
      }
    }
  }

  // Vertical structural pilasters / mullions by architectural style
  for (let c = 0; c <= cols; c++) {
    const mx = c * (winW + padX);
    if (style === 'art-deco-brass') {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(mx + padX * 0.2, 0, 5, canvas.height);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(mx + padX * 0.4, 0, 1.5, canvas.height);
    } else if (style === 'financial-granite' || style === 'limestone-retail') {
      ctx.fillStyle = style === 'limestone-retail' ? '#e7e5e4' : '#a8a29e';
      ctx.fillRect(mx, 0, padX * 0.75, canvas.height);
    } else {
      ctx.fillStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.fillRect(mx + padX * 0.35, 0, 2.5, canvas.height);
    }
  }

  // Diagrid Structural Steel X-Bracing Lattice Overlay
  if (style === 'diagrid-steel') {
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 10;
    const diagSteps = 8;
    const stepH = canvas.height / diagSteps;
    for (let i = 0; i < diagSteps; i++) {
      const y0 = i * stepH;
      const y1 = (i + 1) * stepH;
      ctx.beginPath();
      ctx.moveTo(0, y0);
      ctx.lineTo(canvas.width / 2, y1);
      ctx.lineTo(canvas.width, y0);
      ctx.moveTo(0, y1);
      ctx.lineTo(canvas.width / 2, y0);
      ctx.lineTo(canvas.width, y1);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  return texture;
}

// 2. Server Racks and Lab Interior Texture (for transparent facilities)
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

    // Status indicators
    for (let y = 16; y < 240; y += 12) {
      ctx.fillStyle = Math.random() > 0.3 ? '#22c55e' : '#3b82f6';
      ctx.fillRect(x + 6, y, 6, 4);
      ctx.fillStyle = Math.random() > 0.4 ? '#38bdf8' : '#f59e0b';
      ctx.fillRect(x + 16, y, 12, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 3. Realistic Commercial & Corporate Architectural Signboard
export function createDigitalBillboardTexture(
  title: string,
  subtitle: string,
  primaryColor: string = '#f8fafc',
  accentColor: string = '#38bdf8'
): { texture: THREE.CanvasTexture; update: (time: number) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const texture = new THREE.CanvasTexture(canvas);

  const update = (time: number) => {
    // Polished architectural dark backing
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle dark steel frame
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Elegant brand header
    ctx.fillStyle = primaryColor;
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, 100);

    // Professional subtitle
    ctx.fillStyle = accentColor;
    ctx.font = '500 20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(subtitle, canvas.width / 2, 155);

    // Bottom accent divider
    ctx.fillStyle = '#475569';
    ctx.fillRect(48, 185, canvas.width - 96, 3);

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

// 5. Soft Radial Falloff Light Pool Decal for Street Lamps (Warm 3000K Lighting)
export function createLightPoolDecalTexture(colorHex: string = '#fef3c7'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 4, 64, 64, 62);
  gradient.addColorStop(0, 'rgba(254, 243, 199, 0.65)');
  gradient.addColorStop(0.35, 'rgba(254, 243, 199, 0.35)');
  gradient.addColorStop(0.7, 'rgba(253, 230, 138, 0.12)');
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

// 12b. Building Facade Synchronized PBR Roughness Map (Mirror-smooth glass panes vs matte stone/metal mullions)
export function createProceduralFacadeRoughnessMap(cols = 8, rows = 32): THREE.CanvasTexture {
  const width = 256;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Structural mullion & spandrel base: matte architectural stone/anodized metal (roughness ~0.76)
  ctx.fillStyle = 'rgb(194, 194, 194)';
  ctx.fillRect(0, 0, width, height);

  const padX = 5;
  const padY = 4;
  const winW = (width - padX * (cols + 1)) / cols;
  const winH = (height - padY * (rows + 1)) / rows;

  for (let r = 0; r < rows; r++) {
    const isMechanicalFloor = r === Math.floor(rows * 0.5);
    for (let c = 0; c < cols; c++) {
      const wx = padX + c * (winW + padX);
      const wy = padY + r * (winH + padY);
      if (isMechanicalFloor) {
        // Louver vents: medium-high roughness (0.68)
        ctx.fillStyle = 'rgb(174, 174, 174)';
      } else {
        // Polished low-iron architectural glass pane: mirror-low roughness (0.07)
        ctx.fillStyle = 'rgb(18, 18, 18)';
      }
      ctx.fillRect(wx + 1, wy + 1, Math.max(2, winW - 2), Math.max(2, winH - 2));
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  return tex;
}

// 12c. Street-Level Ashlar Granite & Travertine Stone Masonry Podium Texture (Albedo + Normal)
export function createProceduralStoneMasonryPodiumTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Warm architectural granite & limestone base
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, size, size);

  // Fine mineral grain speckles
  for (let i = 0; i < 9000; i++) {
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.12)';
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }

  // Rusticated ashlar stone courses with recessed mortar joints
  const courses = 8;
  const blocksPerRow = 4;
  const courseH = size / courses;
  const blockW = size / blocksPerRow;

  for (let r = 0; r < courses; r++) {
    const y = r * courseH;
    const offset = (r % 2) * (blockW * 0.5);

    for (let b = -1; b <= blocksPerRow; b++) {
      const x = b * blockW + offset;
      const toneDelta = (Math.sin(r * 3.1 + b * 1.7) * 0.5) * 14;
      const baseLum = 98 + toneDelta;
      ctx.fillStyle = `rgb(${baseLum}, ${baseLum + 6}, ${baseLum + 14})`;
      ctx.fillRect(x + 3, y + 3, blockW - 6, courseH - 6);

      // Top highlight & bottom shadow bevel on each rusticated stone block
      ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.fillRect(x + 3, y + 3, blockW - 6, 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
      ctx.fillRect(x + 3, y + courseH - 5, blockW - 6, 2);
    }

    // Horizontal recessed mortar channel
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, y, size, 3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  return tex;
}

export function createProceduralStoneMasonryNormalMap(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const hField = new Float32Array(size * size);
  const courses = 8;
  const blocksPerRow = 4;
  const courseH = size / courses;
  const blockW = size / blocksPerRow;

  for (let y = 0; y < size; y++) {
    const r = Math.floor(y / courseH);
    const localY = y % courseH;
    const offset = (r % 2) * (blockW * 0.5);

    for (let x = 0; x < size; x++) {
      const localX = (x + size - offset) % blockW;
      const isMortar = localY < 3 || localY > courseH - 3 || localX < 3 || localX > blockW - 3;
      const grain = (Math.random() - 0.5) * 0.06;
      hField[y * size + x] = (isMortar ? 0.0 : 0.45) + grain;
    }
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const strength = 3.2;

  for (let y = 0; y < size; y++) {
    const yPrev = (y - 1 + size) % size;
    const yNext = (y + 1) % size;
    for (let x = 0; x < size; x++) {
      const xPrev = (x - 1 + size) % size;
      const xNext = (x + 1) % size;

      const dzdx = (hField[y * size + xNext] - hField[y * size + xPrev]) * strength;
      const dzdy = (hField[yNext * size + x] - hField[yPrev * size + x]) * strength;
      const len = Math.hypot(-dzdx, -dzdy, 1.0);

      const idx = (y * size + x) * 4;
      data[idx] = Math.floor(((-dzdx / len) * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor(((-dzdy / len) * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor(((1.0 / len) * 0.5 + 0.5) * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  return tex;
}

// 13. Lush Realistic Park Grass Texture
export function createProceduralGrassTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep rich emerald base
  ctx.fillStyle = '#062817';
  ctx.fillRect(0, 0, size, size);

  // Micro-blade and botanical variations
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 35;
    const greenBias = Math.random() * 25;
    data[i] = Math.min(255, Math.max(0, 6 + noise * 0.3));
    data[i + 1] = Math.min(255, Math.max(0, 42 + noise + greenBias));
    data[i + 2] = Math.min(255, Math.max(0, 22 + noise * 0.5));
  }
  ctx.putImageData(imgData, 0, 0);

  // Soft moss & clover clusters
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  for (let c = 0; c < 120; c++) {
    const rx = Math.random() * size;
    const ry = Math.random() * size;
    const rad = 4 + Math.random() * 8;
    ctx.beginPath();
    ctx.arc(rx, ry, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Subtle floral micro-flecks (natural park aesthetics)
  ctx.fillStyle = 'rgba(52, 211, 153, 0.4)';
  for (let f = 0; f < 80; f++) {
    ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  }

  const gTex = new THREE.CanvasTexture(canvas);
  gTex.wrapS = THREE.RepeatWrapping;
  gTex.wrapT = THREE.RepeatWrapping;
  gTex.repeat.set(8, 8);
  gTex.generateMipmaps = true;
  return gTex;
}

// 14. Warm Cobblestone / Flagstone Park Promenade Walkway Texture
export function createCobblestoneParkPathTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, size, size);

  const tileSize = 32;
  for (let y = 0; y < size; y += tileSize) {
    const rowOffset = (Math.floor(y / tileSize) % 2) * (tileSize / 2);
    for (let x = -tileSize; x < size + tileSize; x += tileSize) {
      const stoneX = x + rowOffset;
      const lum = 28 + Math.floor(Math.random() * 18);
      ctx.fillStyle = `rgb(${lum + 4}, ${lum + 8}, ${lum + 14})`;
      ctx.fillRect(stoneX + 2, y + 2, tileSize - 4, tileSize - 4);

      ctx.strokeStyle = '#030712';
      ctx.lineWidth = 2;
      ctx.strokeRect(stoneX + 2, y + 2, tileSize - 4, tileSize - 4);
    }
  }

  const pTex = new THREE.CanvasTexture(canvas);
  pTex.wrapS = THREE.RepeatWrapping;
  pTex.wrapT = THREE.RepeatWrapping;
  pTex.repeat.set(4, 16);
  pTex.generateMipmaps = true;
  return pTex;
}

// 15. Realistic Highway Overhead Gantry Signboard Texture
export function createHighwayGantrySignTexture(
  mainDest: string,
  subDest: string,
  routeCode: string = 'HWY 101'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#064e3b';
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 144);

  // Highway Route Shield
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(24, 22, 100, 42, 8);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(routeCode, 74, 49);

  // Main Destination
  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.fillText(mainDest, 136, 54);

  // Sub destination / Exits
  ctx.font = '600 20px sans-serif';
  ctx.fillStyle = '#fde047';
  ctx.fillText(subDest, 136, 94);

  // Lane Arrows on bottom
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('⬇ ONLY', 36, 134);
  ctx.fillText('⬇ THRU', 240, 134);
  ctx.fillText('⬆ EXIT ↗', 410, 134);

  const sTex = new THREE.CanvasTexture(canvas);
  return sTex;
}

// 12. Burj Khalifa High-Performance Curtain Wall Facade Texture (4K Grade)
export function createBurjKhalifaFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // High-performance reflective silver/azure solar glass base
  ctx.fillStyle = '#0f2744';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 16;
  const rows = 64;
  const colW = canvas.width / cols;
  const rowH = canvas.height / rows;

  for (let r = 0; r < rows; r++) {
    // Horizontal stainless steel spandrel nose with specular top edge
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, r * rowH, canvas.width, 5);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, r * rowH, canvas.width, 1.5);

    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const y = r * rowH + 5;

      // Dark reflective glass pane with interior room illumination
      const isLit = Math.random() > 0.42;
      if (isLit) {
        const grad = ctx.createLinearGradient(x, y, x, y + rowH - 6);
        grad.addColorStop(0, Math.random() > 0.5 ? '#f8fafc' : '#fef3c7');
        grad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.55 + Math.random() * 0.4;
      } else {
        ctx.fillStyle = '#0c1e34';
        ctx.globalAlpha = 1.0;
      }
      ctx.fillRect(x + 3, y, colW - 6, rowH - 6);
      ctx.globalAlpha = 1.0;

      // Vertical stainless steel tubular mullion fin
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x + colW / 2 - 1.5, y, 3, rowH - 5);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 13. Museum of the Future Arabic Calligraphy Facade Texture
export function createMuseumOfFutureCalligraphyTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Sleek brushed stainless steel background
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Brushed metal grain
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 14000; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 6, 1.5);
  }

  // Intricate stylized Arabic poetry calligraphy curves
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawCalligraphyRow = (yCenter: number) => {
    ctx.beginPath();
    for (let x = 30; x < canvas.width - 30; x += 50) {
      const yOff = Math.sin(x * 0.05) * 35 + Math.cos(x * 0.08) * 20;
      ctx.lineTo(x, yCenter + yOff);
      if (x % 100 === 0) {
        ctx.arc(x, yCenter - 20, 12, 0, Math.PI * 1.5);
      }
    }
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 60; x < canvas.width - 60; x += 40) {
      const yOff = Math.cos(x * 0.06) * 24;
      ctx.moveTo(x, yCenter - 40 + yOff);
      ctx.lineTo(x + 24, yCenter + 32 + yOff);
    }
    ctx.stroke();
    ctx.lineWidth = 9;
  };

  drawCalligraphyRow(200);
  drawCalligraphyRow(420);
  drawCalligraphyRow(640);
  drawCalligraphyRow(840);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 14. Dubai Frame & Luxury Tower Gold Islamic Star Lattice Texture
export function createDubaiGoldLatticeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep brushed 24k Gold base
  ctx.fillStyle = '#d97706';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Geometric 8-point Islamic star motif grid
  const step = 64;
  ctx.strokeStyle = '#fef08a';
  ctx.lineWidth = 3.5;

  for (let x = 0; x <= canvas.width; x += step) {
    for (let y = 0; y <= canvas.height; y += step) {
      ctx.strokeRect(x - step / 2, y - step / 2, step, step);

      ctx.beginPath();
      ctx.moveTo(x, y - step / 2);
      ctx.lineTo(x + step / 2, y);
      ctx.lineTo(x, y + step / 2);
      ctx.lineTo(x - step / 2, y);
      ctx.closePath();
      ctx.stroke();

      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 15. Royal Date Palm Tree Trunk Bark Texture
export function createPalmTreeBarkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rowH = 24;
  const colW = 32;
  for (let y = 0; y < canvas.height; y += rowH) {
    const shift = (Math.floor(y / rowH) % 2) * (colW / 2);
    for (let x = -colW; x < canvas.width + colW; x += colW) {
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.moveTo(x + shift, y);
      ctx.lineTo(x + shift + colW / 2, y + rowH / 2);
      ctx.lineTo(x + shift, y + rowH);
      ctx.lineTo(x + shift - colW / 2, y + rowH / 2);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#291003';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 16. Singapore Marina Bay Sands Hotel Balcony & Azure Curtain Wall Texture (4K Grade)
export function createMarinaBaySandsFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0c2d48';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 12;
  const rows = 55;
  const colW = canvas.width / cols;
  const rowH = canvas.height / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    // Continuous white steel cantilevered hotel balcony slab
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, y, canvas.width, 5);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, y + 5, canvas.width, 2);

    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const isLit = Math.random() > 0.35;
      if (isLit) {
        const g = ctx.createLinearGradient(x, y + 7, x, y + rowH);
        g.addColorStop(0, Math.random() > 0.4 ? '#fef3c7' : '#e0f2fe');
        g.addColorStop(1, '#0284c7');
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.78;
      } else {
        ctx.fillStyle = '#082036';
        ctx.globalAlpha = 1.0;
      }
      ctx.fillRect(x + 4, y + 7, colW - 8, rowH - 8);
      ctx.globalAlpha = 1.0;

      // Glass balcony railing line
      ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.fillRect(x + 3, y + rowH * 0.65, colW - 6, 2.5);

      // Vertical structural mullion
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x, y, 3, rowH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 17. Paris Eiffel Tower Wrought-Iron Crisscross Truss Lattice Texture (4K Grade)
export function createEiffelIronLatticeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Deep recessed shadow void inside lattice box girders
  ctx.fillStyle = '#1e1914';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cells = 8;
  const step = canvas.width / cells;

  for (let row = 0; row < cells; row++) {
    for (let col = 0; col < cells; col++) {
      const x = col * step;
      const y = row * step;

      // Primary diagonal X-bracing puddle-iron struts
      ctx.strokeStyle = '#8c7a65';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + step, y + step);
      ctx.moveTo(x + step, y);
      ctx.lineTo(x, y + step);
      ctx.stroke();

      // Secondary inner K-bracing struts
      ctx.strokeStyle = '#a3907a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + step / 2, y);
      ctx.lineTo(x, y + step / 2);
      ctx.lineTo(x + step / 2, y + step);
      ctx.lineTo(x + step, y + step / 2);
      ctx.closePath();
      ctx.stroke();

      // Horizontal & vertical box-girder chords
      ctx.strokeStyle = '#9c8870';
      ctx.lineWidth = 12;
      ctx.strokeRect(x, y, step, step);

      // Gusset plates & iron rivets at intersections
      ctx.fillStyle = '#b5a28c';
      ctx.fillRect(x - 10, y - 10, 20, 20);
      ctx.fillRect(x + step / 2 - 7, y + step / 2 - 7, 14, 14);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 18. Parisian Lutetian Ashlar Limestone & Neoclassical Relief Texture (4K Grade)
export function createParisianLimestoneTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#dfd5c4';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Subtle limestone fossil/mineral grain
  for (let i = 0; i < 20000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(90,75,60,0.08)';
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 3, 2);
  }

  // Ashlar stone courses with running bond mortar joints
  const courseH = 48;
  const blockW = 128;
  for (let y = 0; y < canvas.height; y += courseH) {
    const offset = (Math.floor(y / courseH) % 2) * (blockW / 2);
    ctx.strokeStyle = 'rgba(110, 96, 80, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    for (let x = -blockW; x < canvas.width + blockW; x += blockW) {
      const bx = x + offset;
      const shade = (Math.random() - 0.5) * 12;
      ctx.fillStyle = `rgba(${220 + shade}, ${210 + shade}, ${192 + shade}, 0.28)`;
      ctx.fillRect(bx + 2, y + 2, blockW - 4, courseH - 4);
      ctx.strokeRect(bx, y, blockW, courseH);
    }
  }

  // Neoclassical dentil cornice band & sculpted coffer border
  ctx.fillStyle = '#c8bca7';
  ctx.fillRect(0, 120, canvas.width, 36);
  ctx.fillStyle = '#8c7e6a';
  for (let x = 8; x < canvas.width; x += 24) {
    ctx.fillRect(x, 126, 12, 24);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 19. American Art Deco Indiana Limestone & Stainless Steel Skyscraper Facade (Empire State 4K Grade)
export function createArtDecoLimestoneFacadeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Indiana Limestone warm ashlar masonry base
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fine limestone texture stippling
  ctx.fillStyle = 'rgba(71, 85, 105, 0.12)';
  for (let i = 0; i < 18000; i++) {
    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
  }

  const bays = 10;
  const floors = 44;
  const bayW = canvas.width / bays;
  const floorH = canvas.height / floors;

  for (let b = 0; b < bays; b++) {
    const bx = b * bayW;

    // Continuous Art Deco polished chrome/stainless-steel vertical trim rails flanking each window column
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(bx + 14, 0, 5, canvas.height);
    ctx.fillRect(bx + bayW - 19, 0, 5, canvas.height);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(bx + 19, 0, 2, canvas.height);

    // Dark cast-aluminum vertical spandrel recess channel
    ctx.fillStyle = '#334155';
    ctx.fillRect(bx + 21, 0, bayW - 42, canvas.height);

    for (let f = 0; f < floors; f++) {
      const fy = f * floorH;
      const wx = bx + 23;
      const wy = fy + 6;
      const ww = bayW - 46;
      const wh = floorH - 12;

      // Cast aluminum spandrel plaque with Art Deco geometric chevron relief
      ctx.fillStyle = '#475569';
      ctx.fillRect(wx, fy, ww, 5);

      // Recessed double-hung Art Deco window
      const isLit = Math.random() > 0.34;
      if (isLit) {
        const g = ctx.createLinearGradient(wx, wy, wx, wy + wh);
        g.addColorStop(0, Math.random() > 0.45 ? '#fef3c7' : '#fde68a');
        g.addColorStop(1, '#d97706');
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = '#0f172a';
      }
      ctx.fillRect(wx, wy, ww, wh);

      // Upper & lower sash divider bar
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(wx, wy + wh * 0.5, ww, 2);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

// 20. Prismatic Low-Iron Crystalline Curtain Wall Texture (One World Trade Center 4K Grade)
export function createPrismaticGlassCurtainWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d')!;

  // Sky-reflective crystalline azure base
  const baseGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  baseGrad.addColorStop(0, '#0f2942');
  baseGrad.addColorStop(0.5, '#1e3a5f');
  baseGrad.addColorStop(1, '#0c1e35');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cols = 16;
  const rows = 52;
  const colW = canvas.width / cols;
  const rowH = canvas.height / rows;

  for (let r = 0; r < rows; r++) {
    const y = r * rowH;
    // Stainless steel horizontal spandrel channel
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, y, canvas.width, 3.5);

    for (let c = 0; c < cols; c++) {
      const x = c * colW;
      const isLit = Math.random() > 0.38;
      if (isLit) {
        const g = ctx.createLinearGradient(x, y + 4, x, y + rowH);
        g.addColorStop(0, Math.random() > 0.5 ? '#f8fafc' : '#e0f2fe');
        g.addColorStop(0.7, '#38bdf8');
        g.addColorStop(1, '#0f172a');
        ctx.fillStyle = g;
        ctx.globalAlpha = 0.68;
      } else {
        ctx.fillStyle = '#0f2744';
        ctx.globalAlpha = 0.92;
      }
      ctx.fillRect(x + 2, y + 4, colW - 4, rowH - 5);
      ctx.globalAlpha = 1.0;

      // Ultra-slim silver anodized vertical mullion
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x, y, 2, rowH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}




