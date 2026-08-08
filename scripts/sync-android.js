import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const androidTargetDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'assets', 'public');

console.log('🚀 [1/3] جاري بدء عملية بناء المشروع (npm run build)...');

try {
  // 1. Run build
  execSync('npm run build', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ [2/3] اكتمل البناء بنجاح.');

  // 2. Ensure target directory exists
  if (!fs.existsSync(androidTargetDir)) {
    fs.mkdirSync(androidTargetDir, { recursive: true });
    console.log(`📁 تم إنشاء المسار المستهدف: ${androidTargetDir}`);
  } else {
    // Clean old contents if needed
    fs.rmSync(androidTargetDir, { recursive: true, force: true });
    fs.mkdirSync(androidTargetDir, { recursive: true });
  }

  // 3. Copy dist contents to android/app/src/main/assets/public
  console.log('📦 [3/3] جاري نسخ محتويات مجلد dist إلى مسار أندرويد ستوديو...');
  fs.cpSync(distDir, androidTargetDir, { recursive: true, force: true });

  console.log('\n🎉 تم تحديث ملفات تطبيق أندرويد بنجاح!');
  console.log(`📍 المسار المستهدف: ${androidTargetDir}\n`);
  console.log('💡 يمكنك الآن فتح مشروع أندرويد في Android Studio وبناء حزمة APK أو App Bundle المحدثة.');

} catch (error) {
  console.error('❌ حدث خطأ أثناء عملية البناء والتحديث:', error.message);
  process.exit(1);
}
