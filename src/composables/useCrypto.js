import CryptoJS from 'crypto-js';

export function useCrypto() {
  // 加密函数
  const encrypt = (content, password, algorithm = 'AES-256') => {
    if (!content || !password) return '';
    
    switch (algorithm) {
      case 'AES-128':
        return CryptoJS.AES.encrypt(content, password, { 
          keySize: 128/32,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }).toString();
        
      case 'AES-256':
        return CryptoJS.AES.encrypt(content, password, { 
          keySize: 256/32,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }).toString();
        
      case 'SHA256':
        // SHA256 是哈希算法，这里模拟加密（实际是不可逆的）
        return CryptoJS.SHA256(content + password).toString();
        
      case 'SHA512':
        return CryptoJS.SHA512(content + password).toString();
        
      default:
        return CryptoJS.AES.encrypt(content, password).toString();
    }
  };

  // 解密函数
  const decrypt = (encryptedContent, password, algorithm = 'AES-256') => {
    if (!encryptedContent || !password) return '';
    
    try {
      switch (algorithm) {
        case 'AES-128':
          return CryptoJS.AES.decrypt(encryptedContent, password, {
            keySize: 128/32,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }).toString(CryptoJS.enc.Utf8);
          
        case 'AES-256':
          return CryptoJS.AES.decrypt(encryptedContent, password, {
            keySize: 256/32,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          }).toString(CryptoJS.enc.Utf8);
          
        case 'SHA256':
        case 'SHA512':
          // 哈希算法不可逆，返回提示信息
          return '哈希算法不可逆，无法解密';
          
        default:
          return CryptoJS.AES.decrypt(encryptedContent, password).toString(CryptoJS.enc.Utf8);
      }
    } catch (error) {
      console.error('解密失败:', error);
      return '解密失败，请检查密码和算法是否正确';
    }
  };

  return { encrypt, decrypt };
}