#!/usr/bin/env node

/**
 * Manifest Validation Script for No Reels Extension
 * Validates the manifest.json file for common issues
 */

const fs = require('fs').promises;
const path = require('path');

const MANIFEST_PATH = 'manifest.json';

async function validateManifest() {
  console.log('🔍 Validating manifest.json...\n');
  
  try {
    // Check if file exists
    const exists = await fs.access(MANIFEST_PATH).then(() => true).catch(() => false);
    if (!exists) {
      throw new Error(`Manifest file not found: ${MANIFEST_PATH}`);
    }
    
    // Read and parse JSON
    const content = await fs.readFile(MANIFEST_PATH, 'utf8');
    let manifest;
    
    try {
      manifest = JSON.parse(content);
    } catch (parseError) {
      throw new Error(`Invalid JSON in manifest: ${parseError.message}`);
    }
    
    // Validate required fields
    await validateRequiredFields(manifest);
    
    // Validate manifest version
    await validateManifestVersion(manifest);
    
    // Validate permissions
    await validatePermissions(manifest);
    
    // Validate content scripts
    await validateContentScripts(manifest);
    
    // Validate action
    await validateAction(manifest);
    
    // Validate icons
    await validateIcons(manifest);
    
    // Validate background script
    await validateBackground(manifest);
    
    console.log('✅ Manifest validation completed successfully!\n');
    
    // Print summary
    printManifestSummary(manifest);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Manifest validation failed: ${error.message}\n`);
    return false;
  }
}

async function validateRequiredFields(manifest) {
  console.log('📋 Checking required fields...');
  
  const requiredFields = [
    'manifest_version',
    'name',
    'version',
    'description'
  ];
  
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!manifest[field]) {
      missingFields.push(field);
    } else {
      console.log(`  ✅ ${field}: "${manifest[field]}"`);
    }
  }
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
}

async function validateManifestVersion(manifest) {
  console.log('\n📝 Checking manifest version...');
  
  if (manifest.manifest_version !== 3) {
    console.log(`  ⚠️  Manifest version ${manifest.manifest_version} (consider upgrading to v3)`);
  } else {
    console.log(`  ✅ Manifest version 3 (latest)`);
  }
}

async function validatePermissions(manifest) {
  console.log('\n🔐 Checking permissions...');
  
  if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
    console.log('  ⚠️  No permissions specified');
    return;
  }
  
  const recommendedPermissions = ['storage', 'activeTab', 'scripting', 'notifications'];
  const unnecessaryPermissions = ['tabs', 'browsingData', 'history', 'bookmarks'];
  
  console.log(`  📊 Total permissions: ${manifest.permissions.length}`);
  
  for (const permission of manifest.permissions) {
    if (recommendedPermissions.includes(permission)) {
      console.log(`  ✅ ${permission} (recommended)`);
    } else if (unnecessaryPermissions.includes(permission)) {
      console.log(`  ⚠️  ${permission} (potentially unnecessary)`);
    } else {
      console.log(`  ℹ️  ${permission}`);
    }
  }
  
  // Check for host permissions
  if (manifest.host_permissions && manifest.host_permissions.length > 0) {
    console.log(`  🌐 Host permissions: ${manifest.host_permissions.join(', ')}`);
  }
}

async function validateContentScripts(manifest) {
  console.log('\n📜 Checking content scripts...');
  
  if (!manifest.content_scripts || !Array.isArray(manifest.content_scripts)) {
    console.log('  ⚠️  No content scripts specified');
    return;
  }
  
  for (let i = 0; i < manifest.content_scripts.length; i++) {
    const script = manifest.content_scripts[i];
    console.log(`  📋 Content script ${i + 1}:`);
    
    // Check matches
    if (!script.matches || !Array.isArray(script.matches)) {
      console.log(`    ❌ Missing or invalid matches`);
    } else {
      console.log(`    ✅ Matches: ${script.matches.join(', ')}`);
    }
    
    // Check JS files
    if (!script.js || !Array.isArray(script.js)) {
      console.log(`    ❌ Missing or invalid JS files`);
    } else {
      console.log(`    ✅ JS files: ${script.js.join(', ')}`);
      
      // Check if files exist
      for (const jsFile of script.js) {
        const exists = await fs.access(jsFile).then(() => true).catch(() => false);
        if (!exists) {
          console.log(`    ⚠️  JS file not found: ${jsFile}`);
        }
      }
    }
    
    // Check run_at
    if (script.run_at) {
      const validRunAt = ['document_start', 'document_end', 'document_idle'];
      if (validRunAt.includes(script.run_at)) {
        console.log(`    ✅ Run at: ${script.run_at}`);
      } else {
        console.log(`    ⚠️  Invalid run_at: ${script.run_at}`);
      }
    }
  }
}

async function validateAction(manifest) {
  console.log('\n🎯 Checking action/browser_action...');
  
  const action = manifest.action || manifest.browser_action;
  
  if (!action) {
    console.log('  ⚠️  No action specified');
    return;
  }
  
  if (action.default_popup) {
    console.log(`  ✅ Default popup: ${action.default_popup}`);
    
    // Check if popup file exists
    const exists = await fs.access(action.default_popup).then(() => true).catch(() => false);
    if (!exists) {
      console.log(`  ⚠️  Popup file not found: ${action.default_popup}`);
    }
  }
  
  if (action.default_title) {
    console.log(`  ✅ Default title: "${action.default_title}"`);
  }
  
  if (action.default_icon) {
    console.log(`  ✅ Default icon specified`);
  }
}

async function validateIcons(manifest) {
  console.log('\n🎨 Checking icons...');
  
  if (!manifest.icons) {
    console.log('  ⚠️  No icons specified');
    return;
  }
  
  const recommendedSizes = ['16', '48', '128'];
  const specifiedSizes = Object.keys(manifest.icons);
  
  console.log(`  📊 Icon sizes: ${specifiedSizes.join(', ')}`);
  
  for (const size of recommendedSizes) {
    if (specifiedSizes.includes(size)) {
      console.log(`  ✅ ${size}px icon specified`);
      
      // Check if icon file exists
      const iconPath = manifest.icons[size];
      const exists = await fs.access(iconPath).then(() => true).catch(() => false);
      if (!exists) {
        console.log(`    ⚠️  Icon file not found: ${iconPath}`);
      }
    } else {
      console.log(`  ⚠️  Missing recommended ${size}px icon`);
    }
  }
}

async function validateBackground(manifest) {
  console.log('\n🔧 Checking background script...');
  
  if (!manifest.background) {
    console.log('  ⚠️  No background script specified');
    return;
  }
  
  if (manifest.manifest_version === 3) {
    // Manifest V3 should use service_worker
    if (manifest.background.service_worker) {
      console.log(`  ✅ Service worker: ${manifest.background.service_worker}`);
      
      // Check if file exists
      const exists = await fs.access(manifest.background.service_worker).then(() => true).catch(() => false);
      if (!exists) {
        console.log(`    ⚠️  Service worker file not found: ${manifest.background.service_worker}`);
      }
    } else {
      console.log('  ❌ Manifest V3 requires service_worker, not scripts');
    }
  } else {
    // Manifest V2 uses scripts
    if (manifest.background.scripts) {
      console.log(`  ✅ Background scripts: ${manifest.background.scripts.join(', ')}`);
    }
  }
}

function printManifestSummary(manifest) {
  console.log('📋 Manifest Summary:');
  console.log(`  Name: ${manifest.name}`);
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Manifest Version: ${manifest.manifest_version}`);
  console.log(`  Description: ${manifest.description}`);
  
  if (manifest.permissions) {
    console.log(`  Permissions: ${manifest.permissions.length} total`);
  }
  
  if (manifest.content_scripts) {
    console.log(`  Content Scripts: ${manifest.content_scripts.length} total`);
  }
  
  if (manifest.icons) {
    console.log(`  Icons: ${Object.keys(manifest.icons).length} sizes`);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateManifest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { validateManifest };