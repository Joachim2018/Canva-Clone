import { CanvasDocument, CanvasElement, CanvasPage } from '../types/canvas';

// Render a canvas page onto an HTML5 canvas element for crisp rasterization
export async function renderPageToCanvas(
  page: CanvasPage,
  docWidth: number,
  docHeight: number,
  scale: number = 2
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = docWidth * scale;
  canvas.height = docHeight * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Clear and scale
  ctx.scale(scale, scale);

  // Background
  if (page.backgroundColor) {
    ctx.fillStyle = page.backgroundColor;
    ctx.fillRect(0, 0, docWidth, docHeight);
  }

  // Sort elements by zIndex
  const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    ctx.save();
    ctx.globalAlpha = el.opacity ?? 1;

    // Translation for rotation around center
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    ctx.translate(cx, cy);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }
    ctx.translate(-cx, -cy);

    if (el.type === 'shape') {
      ctx.fillStyle = el.fill || 'transparent';
      ctx.strokeStyle = el.stroke || 'transparent';
      ctx.lineWidth = el.strokeWidth || 0;

      if (el.shapeType === 'rectangle') {
        const r = el.borderRadius || 0;
        ctx.beginPath();
        if (r > 0) {
          ctx.roundRect(el.x, el.y, el.width, el.height, r);
        } else {
          ctx.rect(el.x, el.y, el.width, el.height);
        }
        if (el.fill && el.fill !== 'transparent') ctx.fill();
        if (el.strokeWidth > 0 && el.stroke !== 'transparent') ctx.stroke();
      } else if (el.shapeType === 'circle') {
        ctx.beginPath();
        ctx.ellipse(cx, cy, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
        if (el.fill && el.fill !== 'transparent') ctx.fill();
        if (el.strokeWidth > 0 && el.stroke !== 'transparent') ctx.stroke();
      } else if (el.shapeType === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(cx, el.y);
        ctx.lineTo(el.x + el.width, el.y + el.height);
        ctx.lineTo(el.x, el.y + el.height);
        ctx.closePath();
        if (el.fill && el.fill !== 'transparent') ctx.fill();
        if (el.strokeWidth > 0 && el.stroke !== 'transparent') ctx.stroke();
      } else if (el.shapeType === 'star') {
        const spikes = 5;
        const outerRadius = Math.min(el.width, el.height) / 2;
        const innerRadius = outerRadius * 0.45;
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
          let x = cx + Math.cos(rot) * outerRadius;
          let y = cy + Math.sin(rot) * outerRadius;
          ctx.lineTo(x, y);
          rot += step;

          x = cx + Math.cos(rot) * innerRadius;
          y = cy + Math.sin(rot) * innerRadius;
          ctx.lineTo(x, y);
          rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        if (el.fill && el.fill !== 'transparent') ctx.fill();
        if (el.strokeWidth > 0 && el.stroke !== 'transparent') ctx.stroke();
      } else if (el.shapeType === 'line') {
        ctx.beginPath();
        ctx.moveTo(el.x, cy);
        ctx.lineTo(el.x + el.width, cy);
        ctx.lineWidth = el.strokeWidth || 4;
        ctx.strokeStyle = el.stroke || el.fill || '#000';
        ctx.stroke();
      } else {
        // default rectangle fallback
        ctx.fillRect(el.x, el.y, el.width, el.height);
      }
    } else if (el.type === 'text') {
      ctx.fillStyle = el.color || '#000000';
      const weight = el.fontWeight || 'normal';
      const style = el.fontStyle === 'italic' ? 'italic' : 'normal';
      const family = el.fontFamily || 'Plus Jakarta Sans';
      const size = el.fontSize || 24;
      ctx.font = `${style} ${weight} ${size}px "${family}", sans-serif`;
      ctx.textAlign = (el.textAlign as CanvasTextAlign) || 'left';
      ctx.textBaseline = 'top';

      const lines = el.text.split('\n');
      const lineHeight = size * (el.lineHeight || 1.2);

      let textX = el.x;
      if (el.textAlign === 'center') textX = cx;
      else if (el.textAlign === 'right') textX = el.x + el.width;

      lines.forEach((line, index) => {
        ctx.fillText(line, textX, el.y + index * lineHeight);
      });
    } else if (el.type === 'image') {
      try {
        const img = await loadImage(el.src);
        if (el.borderRadius) {
          ctx.beginPath();
          ctx.roundRect(el.x, el.y, el.width, el.height, el.borderRadius);
          ctx.clip();
        }
        ctx.drawImage(img, el.x, el.y, el.width, el.height);
      } catch (err) {
        // Fallback placeholder box
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(el.x, el.y, el.width, el.height);
      }
    } else if (el.type === 'drawing') {
      if (el.points && el.points.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = el.strokeColor || '#7D2AE8';
        ctx.lineWidth = el.strokeWidth || 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (el.tool === 'highlighter') {
          ctx.globalAlpha = 0.4;
        }

        ctx.moveTo(el.points[0].x, el.points[0].y);
        for (let i = 1; i < el.points.length; i++) {
          ctx.lineTo(el.points[i].x, el.points[i].y);
        }
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  return canvas;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Download image as PNG
export async function downloadPageAsPNG(
  page: CanvasPage,
  docWidth: number,
  docHeight: number,
  filename: string = 'canva-design.png',
  scale: number = 2
) {
  const canvas = await renderPageToCanvas(page, docWidth, docHeight, scale);
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

// Download vector as SVG
export function downloadPageAsSVG(
  page: CanvasPage,
  docWidth: number,
  docHeight: number,
  filename: string = 'canva-design.svg'
) {
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${docWidth} ${docHeight}" width="${docWidth}" height="${docHeight}">\n`;

  // Background
  if (page.backgroundColor) {
    svgContent += `  <rect width="${docWidth}" height="${docHeight}" fill="${page.backgroundColor}" />\n`;
  }

  // Elements
  const sorted = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);
  for (const el of sorted) {
    const rotTransform = el.rotation
      ? ` transform="rotate(${el.rotation} ${el.x + el.width / 2} ${el.y + el.height / 2})"`
      : '';
    const opacityAttr = el.opacity !== 1 ? ` opacity="${el.opacity}"` : '';

    if (el.type === 'shape') {
      if (el.shapeType === 'rectangle') {
        const rx = el.borderRadius ? ` rx="${el.borderRadius}" ry="${el.borderRadius}"` : '';
        svgContent += `  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"${rx}${rotTransform}${opacityAttr} />\n`;
      } else if (el.shapeType === 'circle') {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"${rotTransform}${opacityAttr} />\n`;
      } else if (el.shapeType === 'line') {
        svgContent += `  <line x1="${el.x}" y1="${el.y}" x2="${el.x + el.width}" y2="${el.y}" stroke="${el.stroke || el.fill}" stroke-width="${el.strokeWidth || 4}"${rotTransform}${opacityAttr} />\n`;
      }
    } else if (el.type === 'text') {
      const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
      const tx = el.textAlign === 'center' ? el.x + el.width / 2 : el.textAlign === 'right' ? el.x + el.width : el.x;
      const lines = el.text.split('\n');
      const lineHeight = (el.fontSize || 24) * 1.2;

      svgContent += `  <text x="${tx}" y="${el.y + (el.fontSize || 24)}" font-family="${el.fontFamily}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" fill="${el.color}" text-anchor="${anchor}"${rotTransform}${opacityAttr}>\n`;
      lines.forEach((line, i) => {
        svgContent += `    <tspan x="${tx}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>\n`;
      });
      svgContent += `  </text>\n`;
    } else if (el.type === 'image') {
      svgContent += `  <image href="${el.src}" x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice"${rotTransform}${opacityAttr} />\n`;
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Download Project JSON
export function downloadProjectJSON(doc: CanvasDocument) {
  const jsonStr = JSON.stringify(doc, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `${doc.title.toLowerCase().replace(/\s+/g, '-')}.canva.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}
