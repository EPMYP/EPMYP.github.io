import CryptoJS from 'crypto-js'

/**
 * AES-128 加密
 */
export function encryptAES128(text, password) {
  try {
    return CryptoJS.AES.encrypt(text, password).toString()
  } catch (error) {
    throw new Error('AES-128加密失败: ' + error.message)
  }
}

/**
 * AES-128 解密
 */
export function decryptAES128(encryptedText, password) {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, password)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    if (!decrypted) {
      throw new Error('解密失败，密码可能不正确')
    }
    return decrypted
  } catch (error) {
    throw new Error('AES-128解密失败: ' + error.message)
  }
}

/**
 * AES-256 加密
 */
export function encryptAES256(text, password) {
  try {
    // 使用PBKDF2生成256位密钥
    const key = CryptoJS.PBKDF2(password, 'salt', {
      keySize: 256 / 32,
      iterations: 10000
    })
    return CryptoJS.AES.encrypt(text, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString()
  } catch (error) {
    throw new Error('AES-256加密失败: ' + error.message)
  }
}

/**
 * AES-256 解密
 */
export function decryptAES256(encryptedText, password) {
  try {
    const key = CryptoJS.PBKDF2(password, 'salt', {
      keySize: 256 / 32,
      iterations: 10000
    })
    const bytes = CryptoJS.AES.decrypt(encryptedText, key, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    if (!decrypted) {
      throw new Error('解密失败，密码可能不正确')
    }
    return decrypted
  } catch (error) {
    throw new Error('AES-256解密失败: ' + error.message)
  }
}

/**
 * SHA256 哈希（不可逆，用于验证）
 */
export function hashSHA256(text) {
  try {
    return CryptoJS.SHA256(text).toString()
  } catch (error) {
    throw new Error('SHA256哈希失败: ' + error.message)
  }
}

/**
 * SHA512 哈希（不可逆，用于验证）
 */
export function hashSHA512(text) {
  try {
    return CryptoJS.SHA512(text).toString()
  } catch (error) {
    throw new Error('SHA512哈希失败: ' + error.message)
  }
}

/**
 * 统一的加密函数
 */
export function encrypt(text, method, password) {
  switch (method) {
    case 'aes-128':
      return encryptAES128(text, password)
    case 'aes-256':
      return encryptAES256(text, password)
    case 'sha256':
      return hashSHA256(text)
    case 'sha512':
      return hashSHA512(text)
    default:
      throw new Error('不支持的加密方法: ' + method)
  }
}

/**
 * 统一的解密函数（仅支持AES）
 */
export function decrypt(encryptedText, method, password) {
  switch (method) {
    case 'aes-128':
      return decryptAES128(encryptedText, password)
    case 'aes-256':
      return decryptAES256(encryptedText, password)
    case 'sha256':
    case 'sha512':
      throw new Error('SHA256和SHA512是单向哈希，无法解密')
    default:
      throw new Error('不支持的解密方法: ' + method)
  }
}

