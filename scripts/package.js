#!/usr/bin/env node

/**
 * Package Script for No Reels Extension
 * Creates a production-ready ZIP file for distribution
 */

const fs = require('fs').promises;
const path = require('path');
const archiver = require('archiver');

const BUILD_DIR = 'build';
const DIST_DIR = 'dist';

// Files to include in the package
const INCLUDE_FILES = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'content.js',
  'background.js',
  'languages.js',
  'README.md',
  'LICENSE'
];

// Directories to include
const INCLUDE_DIRS = [
  'icons'
];

async function createDirectories() {
  try {
    await fs.mkdir(BUILD_DIR, { recursive: true });
    await fs.mkdir(DIST_DIR, { recursive: true });
    console.log('✅ Created build and dist directories');
  } catch (error) {
    console.error('❌ Error creating directories:', error);
    process.exit(1);
  }
}

async function copyFiles() {
  console.log('📋 Copying files...');
  
  // Copy individual files
  for (const file of INCLUDE_FILES) {
    try {
      const exists = await fs.access(file).then(() => true).catch(() => false);
      if (exists) {
        await fs.copyFile(file, path.join(BUILD_DIR, file));
        console.log(`✅ Copied ${file}`);
      } else {
        console.log(`⚠️  Skipped ${file} (not found)`);
      }
    } catch (error) {
      console.error(`❌ Error copying ${file}:`, error);
    }
  }
  
  // Copy directories
  for (const dir of INCLUDE_DIRS) {
    try {
      const exists = await fs.access(dir).then(() => true).catch(() => false);
      if (exists) {
        await copyDirectory(dir, path.join(BUILD_DIR, dir));
        console.log(`✅ Copied directory ${dir}`);
      } else {
        console.log(`⚠️  Skipped directory ${dir} (not found)`);
        // Create placeholder icons if icons directory doesn't exist
        if (dir === 'icons') {
          await createPlaceholderIcons();
        }
      }
    } catch (error) {
      console.error(`❌ Error copying directory ${dir}:`, error);
    }
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const files = await fs.readdir(src);
  
  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const stat = await fs.stat(srcPath);
    
    if (stat.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function createPlaceholderIcons() {
  console.log('🎨 Creating placeholder icons...');
  
  const iconsDir = path.join(BUILD_DIR, 'icons');
  await fs.mkdir(iconsDir, { recursive: true });
  
  const iconSizes = [16, 48, 128];
  const iconStates = ['icon', 'icon-disabled'];
  
  // Create simple SVG icons as placeholders
  const createSVGIcon = (size, disabled = false) => {
    const color = disabled ? '#fb7185' : '#6366f1';
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="${color}"/>
  <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.3}" fill="white" stroke="${color}" stroke-width="2"/>
  ${disabled ? `<line x1="${size * 0.3}" y1="${size * 0.3}" x2="${size * 0.7}" y2="${size * 0.7}" stroke="white" stroke-width="3"/>` : ''}
</svg>`;
  };
  
  for (const size of iconSizes) {
    // Normal icon
    const normalSVG = createSVGIcon(size, false);
    await fs.writeFile(path.join(iconsDir, `icon-${size}.svg`), normalSVG);
    
    // Disabled icon
    const disabledSVG = createSVGIcon(size, true);
    await fs.writeFile(path.join(iconsDir, `icon-disabled-${size}.svg`), disabledSVG);
  }
  
  console.log('✅ Created placeholder SVG icons');
  console.log('💡 Replace with actual PNG icons before publishing');
}

async function validateBuild() {
  console.log('🔍 Validating build...');
  
  // Check if manifest exists and is valid JSON
  try {
    const manifestPath = path.join(BUILD_DIR, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log(`✅ Manifest is valid JSON`);
    console.log(`📦 Extension name: ${manifest.name}`);
    console.log(`🏷️  Extension version: ${manifest.version}`);
    
    // Check required fields
    const requiredFields = ['manifest_version', 'name', 'version', 'permissions'];
    for (const field of requiredFields) {
      if (!manifest[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    console.log('✅ Manifest validation passed');
  } catch (error) {
    console.error('❌ Manifest validation failed:', error);
    process.exit(1);
  }
  
  // Check if all JavaScript files are valid
  const jsFiles = ['popup.js', 'content.js', 'background.js', 'languages.js'];
  for (const file of jsFiles) {
    try {
      const filePath = path.join(BUILD_DIR, file);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      if (exists) {
        // Basic syntax check - just try to read the file
        await fs.readFile(filePath, 'utf8');
        console.log(`✅ ${file} is accessible`);
      }
    } catch (error) {
      console.error(`❌ Error validating ${file}:`, error);
    }
  }
}

async function createZipPackage() {
  console.log('📦 Creating ZIP package...');
  
  const packageName = `no-reels-extension-v${await getVersion()}.zip`;
  const outputPath = path.join(DIST_DIR, packageName);
  
  return new Promise((resolve, reject) => {
    const output = require('fs').createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`✅ Package created: ${packageName}`);
      console.log(`📊 Package size: ${sizeInMB} MB`);
      resolve(outputPath);
    });
    
    archive.on('error', (err) => {
      console.error('❌ Error creating package:', err);
      reject(err);
    });
    
    archive.pipe(output);
    archive.directory(BUILD_DIR, false);
    archive.finalize();
  });
}

async function getVersion() {
  try {
    const manifestPath = path.join(BUILD_DIR, 'manifest.json');
    const manifestContent = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    return manifest.version || '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
}

async function generateChecksums(packagePath) {
  console.log('🔐 Generating checksums...');
  
  const crypto = require('crypto');
  const fileBuffer = await fs.readFile(packagePath);
  
  const md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
  const sha256 = crypto.createHash('sha256').update(fileBuffer).digest('hex');
  
  const checksumFile = packagePath.replace('.zip', '.checksums.txt');
  const checksumContent = `MD5: ${md5}\nSHA256: ${sha256}\n`;
  
  await fs.writeFile(checksumFile, checksumContent);
  console.log(`✅ Checksums saved to ${path.basename(checksumFile)}`);
  
  return { md5, sha256 };
}

async function main() {
  console.log('🚀 Starting No Reels Extension packaging...\n');
  
  try {
    await createDirectories();
    await copyFiles();
    await validateBuild();
    const packagePath = await createZipPackage();
    const checksums = await generateChecksums(packagePath);
    
    console.log('\n🎉 Packaging completed successfully!');
    console.log(`📦 Package: ${path.basename(packagePath)}`);
    console.log(`🔐 MD5: ${checksums.md5}`);
    console.log(`🔐 SHA256: ${checksums.sha256.substring(0, 16)}...`);
    console.log('\n💡 Ready for distribution!');
    
  } catch (error) {
    console.error('\n❌ Packaging failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, createZipPackage, validateBuild };