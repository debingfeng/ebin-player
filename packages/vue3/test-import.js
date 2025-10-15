// 测试Vue3包是否可以正常导入
try {
  const { EbinPlayer, ensureStylesInjected } = require('./dist/index.js');
  console.log('✅ Vue3包导入成功');
  console.log('EbinPlayer:', typeof EbinPlayer);
  console.log('ensureStylesInjected:', typeof ensureStylesInjected);
} catch (error) {
  console.error('❌ Vue3包导入失败:', error.message);
  process.exit(1);
}
