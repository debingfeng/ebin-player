// 测试Vue2包是否可以正常导入
try {
  const { ensureStylesInjected } = require('./dist/index.js');
  console.log('✅ Vue2包导入成功');
  console.log('ensureStylesInjected:', typeof ensureStylesInjected);
  
  // 测试函数调用
  ensureStylesInjected({ mode: 'manual' });
  console.log('✅ ensureStylesInjected 函数调用成功');
} catch (error) {
  console.error('❌ Vue2包导入失败:', error.message);
  process.exit(1);
}
