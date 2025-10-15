// 简单测试Vue2包
console.log('测试Vue2包...');

try {
  // 直接导入styleInjection
  const styleInjection = require('./dist/styleInjection.js');
  console.log('✅ styleInjection 导入成功:', typeof styleInjection.ensureStylesInjected);
  
  // 测试函数调用
  styleInjection.ensureStylesInjected({ mode: 'manual' });
  console.log('✅ ensureStylesInjected 函数调用成功');
  
  console.log('✅ Vue2包基本功能测试通过');
} catch (error) {
  console.error('❌ Vue2包测试失败:', error.message);
  process.exit(1);
}
