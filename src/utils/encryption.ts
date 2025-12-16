// 导入CryptoJS库，用于加密解密操作
import CryptoJS from 'crypto-js';

/**
 * SHA256加密函数
 * @param data 待加密的原始数据（字符串）
 * @param secretKey 加密密钥（可选参数）
 * @returns 加密后的16进制字符串
 * @description 无密钥时使用普通SHA256加密，有密钥时使用HmacSHA256加密
 */
export const sha256Encrypt = (data: string, secretKey?: string): string => {
  if (secretKey) {
    // HmacSHA256：带密钥的SHA256加密，安全性更高
    return CryptoJS.HmacSHA256(data, secretKey).toString(CryptoJS.enc.Hex);
  }
  // 普通SHA256加密
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
};

/**
 * SHA256加密验证函数
 * @param data 原始数据
 * @param encryptedData 已加密的数据
 * @param secretKey 加密密钥（可选，需与加密时一致）
 * @returns 验证结果（true：匹配，false：不匹配）
 * @description 用于验证数据是否被篡改或密码是否正确
 */
export const verifySha256 = (
  data: string,
  encryptedData: string,
  secretKey?: string
): boolean => {
  // 重新加密原始数据，与已加密数据对比
  return sha256Encrypt(data, secretKey) === encryptedData;
};

/**
 * 文章内容加密处理
 * @param content 文章原始内容
 * @param password 加密密码
 * @returns 加密后的文章内容
 * @description 结合SHA256和AES加密，先通过SHA256处理密码生成密钥，再用AES加密文章内容
 */
export const encryptArticle = (content: string, password: string): string => {
  // 生成32位密钥（AES-256需要32位密钥）
  const key = CryptoJS.enc.Utf8.parse(sha256Encrypt(password).substring(0, 32));
  // 生成16位初始向量（IV）
  const iv = CryptoJS.enc.Utf8.parse(sha256Encrypt(password).substring(0, 16));
  
  // 使用AES-CBC模式加密，Pkcs7填充方式
  const encrypted = CryptoJS.AES.encrypt(content, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC, // CBC模式：安全性较高，需要初始向量
    padding: CryptoJS.pad.Pkcs7 // 填充方式：Pkcs7是常用标准
  });
  
  // 返回加密后的字符串
  return encrypted.toString();
};

/**
 * 文章内容解密处理
 * @param encryptedContent 加密后的文章内容
 * @param password 解密密码
 * @returns 解密后的文章内容（解密失败返回空字符串）
 * @description 与encryptArticle对应，先验证密码生成密钥，再用AES解密
 */
export const decryptArticle = (encryptedContent: string, password: string): string => {
  try {
    // 生成与加密时相同的密钥和初始向量
    const key = CryptoJS.enc.Utf8.parse(sha256Encrypt(password).substring(0, 32));
    const iv = CryptoJS.enc.Utf8.parse(sha256Encrypt(password).substring(0, 16));
    
    // AES解密
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 将解密结果转换为UTF8字符串
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    // 解密失败（密码错误或数据损坏）
    console.error('解密失败:', error);
    return '';
  }
};