#!/usr/bin/env node

/**
 * Migration script to help convert components from old translation system to next-i18next
 * 
 * Usage: node scripts/migrate-i18n.js [component-path]
 * Example: node scripts/migrate-i18n.js components/layout/header.tsx
 */

const fs = require('fs');
const path = require('path');

function migrateComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;

  // Replace old import
  if (content.includes("import { useTranslation } from '@/lib/hooks/useTranslation'")) {
    content = content.replace(
      "import { useTranslation } from '@/lib/hooks/useTranslation'",
      "import { useI18n } from '@/lib/hooks/useI18n'"
    );
    hasChanges = true;
    console.log('✅ Updated import statement');
  }

  // Replace hook usage
  if (content.includes('const { t } = useTranslation()')) {
    content = content.replace(
      'const { t } = useTranslation()',
      'const { t } = useI18n()'
    );
    hasChanges = true;
    console.log('✅ Updated hook usage');
  }

  // Add 'use client' directive if not present and component uses hooks
  if (!content.includes("'use client'") && content.includes('useI18n')) {
    content = "'use client';\n\n" + content;
    hasChanges = true;
    console.log('✅ Added use client directive');
  }

  if (hasChanges) {
    // Create backup
    const backupPath = filePath + '.backup';
    fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
    console.log(`📁 Created backup: ${backupPath}`);

    // Write updated content
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`ℹ️  No changes needed for: ${filePath}`);
  }
}

function findComponentsToMigrate(dir = '.') {
  const components = [];
  
  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('useTranslation')) {
          components.push(fullPath);
        }
      }
    }
  }
  
  scanDirectory(dir);
  return components;
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('🔍 Scanning for components to migrate...');
  const components = findComponentsToMigrate();
  
  if (components.length === 0) {
    console.log('✅ No components found that need migration');
  } else {
    console.log(`📋 Found ${components.length} components to migrate:`);
    components.forEach(comp => console.log(`  - ${comp}`));
    
    console.log('\n💡 To migrate a specific component, run:');
    console.log(`   node scripts/migrate-i18n.js <component-path>`);
    console.log('\n💡 To migrate all components, run:');
    console.log('   node scripts/migrate-i18n.js --all');
  }
} else if (args[0] === '--all') {
  console.log('🔄 Migrating all components...');
  const components = findComponentsToMigrate();
  
  components.forEach(component => {
    console.log(`\n🔄 Migrating: ${component}`);
    migrateComponent(component);
  });
  
  console.log('\n✅ Migration complete!');
} else {
  const filePath = args[0];
  console.log(`🔄 Migrating: ${filePath}`);
  migrateComponent(filePath);
}

console.log('\n📚 For more information, see: docs/I18N_MIGRATION.md');