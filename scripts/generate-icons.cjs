/**
 * PWA Icon Generator Script
 * Generates all required PNG icons from the source SVG
 */

const fs = require('fs');
const path = require('path');

// Check for required module
try {
    require.resolve('sharp');
} catch (e) {
    console.log('Installing sharp module...');
    require('child_process').execSync('npm install sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SVG_PATH = path.join(PUBLIC_DIR, 'icon.svg');

// All required icon sizes
const ICON_SIZES = [16, 32, 72, 96, 128, 144, 152, 167, 180, 192, 384, 512];

async function generateIcons() {
    console.log('🎨 Generating PWA Icons from icon.svg...\n');

    // Read SVG
    const svgBuffer = fs.readFileSync(SVG_PATH);

    for (const size of ICON_SIZES) {
        const outputPath = path.join(PUBLIC_DIR, `icon-${size}.png`);

        try {
            await sharp(svgBuffer)
                .resize(size, size)
                .png()
                .toFile(outputPath);

            console.log(`✅ Generated icon-${size}.png`);
        } catch (error) {
            console.error(`❌ Failed to generate icon-${size}.png:`, error.message);
        }
    }

    console.log('\n✨ Icon generation complete!');
}

generateIcons().catch(console.error);
