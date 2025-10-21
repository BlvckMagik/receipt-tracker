import sharp from 'sharp';

export async function preprocessImage(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(null, 2000, { // Збільшуємо висоту до 2000px для кращої якості
      withoutEnlargement: false
    })
    .grayscale() // Перетворюємо в чорно-біле
    .normalize() // Нормалізуємо контраст
    .sharpen({ sigma: 1.0, m1: 0.5, m2: 3.0, x1: 2.0, y2: 10.0 }) // Агресивне підвищення різкості
    .modulate({
      brightness: 1.1, // Трохи яскравіше
      saturation: 0, // Повністю десатуроване
      hue: 0
    })
    .threshold(140) // Більш агресивна бінаризація
    .png({ quality: 100, compressionLevel: 0 })
    .toFile(outputPath);
}
