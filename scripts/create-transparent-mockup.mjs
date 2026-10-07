import sharp from "sharp";

async function processMockup() {
  const inputPath = "C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\8a196c39-fa16-4ce1-bf20-2a9620e69cc7\\devices_pure_black_1791359988450.jpg";
  const outputPath = "c:\\Users\\hp\\Desktop\\Webgent\\public\\images\\hero-devices-transparent.png";
  const webpPath = "c:\\Users\\hp\\Desktop\\Webgent\\public\\images\\hero-devices-transparent.webp";

  const img = sharp(inputPath);
  const metadata = await img.metadata();
  const width = metadata.width;
  const height = metadata.height;

  const rawRgb = await img.raw().toBuffer();

  const visited = new Uint8Array(width * height);
  const queue = [];
  const threshold = 18;

  function isBg(x, y) {
    const idx = (y * width + x) * 3;
    return Math.max(rawRgb[idx], rawRgb[idx + 1], rawRgb[idx + 2]) <= threshold;
  }

  for (let x = 0; x < width; x++) {
    if (isBg(x, 0)) { visited[x] = 1; queue.push([x, 0]); }
    if (isBg(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue.push([x, height - 1]); }
  }
  for (let y = 0; y < height; y++) {
    if (isBg(0, y)) { visited[y * width] = 1; queue.push([0, y]); }
    if (isBg(width - 1, y)) { visited[y * width + (width - 1)] = 1; queue.push([width - 1, y]); }
  }

  let head = 0;
  while (head < queue.length) {
    const [cx, cy] = queue[head++];
    const neighbors = [
      [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
    ];
    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIdx = ny * width + nx;
        if (!visited[nIdx] && isBg(nx, ny)) {
          visited[nIdx] = 1;
          queue.push([nx, ny]);
        }
      }
    }
  }

  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const rgbIdx = i * 3;
    const rgbaIdx = i * 4;

    rgba[rgbaIdx] = rawRgb[rgbIdx];
    rgba[rgbaIdx + 1] = rawRgb[rgbIdx + 1];
    rgba[rgbaIdx + 2] = rawRgb[rgbIdx + 2];

    if (visited[i] === 1) {
      rgba[rgbaIdx + 3] = 0;
    } else {
      rgba[rgbaIdx + 3] = 255;
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      if (visited[i] === 0) {
        const isEdge =
          visited[i - 1] === 1 ||
          visited[i + 1] === 1 ||
          visited[i - width] === 1 ||
          visited[i + width] === 1;

        if (isEdge) {
          const rgbaIdx = i * 4;
          const maxVal = Math.max(rgba[rgbaIdx], rgba[rgbaIdx + 1], rgba[rgbaIdx + 2]);
          if (maxVal < 40) {
            rgba[rgbaIdx + 3] = Math.round(((maxVal - threshold) / (40 - threshold)) * 255);
          }
        }
      }
    }
  }

  // Trim empty margins
  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim()
    .webp({ quality: 95, effort: 6 })
    .toFile(webpPath);

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .trim()
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log("Successfully trimmed and saved transparent mockup!");
}

processMockup().catch(console.error);
