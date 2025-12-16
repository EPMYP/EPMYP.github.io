<template>
  <div class="donation-section">
    <div class="donation-header">
      <h3 class="donation-title">
        <span class="icon">💰</span>
        赞赏支持
      </h3>
    </div>

    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="configs.length === 0" class="no-config">
      <p>暂未配置支付方式</p>
    </div>

    <div v-else class="payment-methods">
      <div
        v-for="config in configs"
        :key="config.id"
        class="payment-item"
        @click="showQRCode(config)"
      >
        <div class="payment-icon">
          <span>{{ getPaymentIcon(config.payment_type) }}</span>
        </div>
        <div class="payment-info">
          <h4>{{ getPaymentName(config.payment_type) }}</h4>
          <p v-if="config.address">{{ config.address }}</p>
        </div>
      </div>
    </div>

    <!-- 二维码弹窗 -->
    <div v-if="showQR" class="qr-modal" @click.self="showQR = false">
      <div class="qr-content">
        <button class="close-btn" @click="showQR = false">×</button>
        <h3>{{ getPaymentName(currentPayment?.payment_type) }}</h3>
        <img v-if="currentPayment?.qr_code_url" :src="currentPayment.qr_code_url" alt="支付二维码" class="qr-image" />
        <p v-if="currentPayment?.address" class="payment-address">
          <strong>地址：</strong>
          <code>{{ currentPayment.address }}</code>
          <button class="copy-btn" @click="copyAddress">复制</button>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { paymentsAPI } from '../api/payments.js';

const props = defineProps({
  articleId: {
    type: [String, Number],
    required: true
  }
});

const configs = ref([]);
const loading = ref(true);
const showQR = ref(false);
const currentPayment = ref(null);

const getPaymentIcon = (type) => {
  const icons = {
    wechat: '💚',
    alipay: '💙',
    usdt_trc20: '₮',
    bitcoin: '₿',
    ethereum: 'Ξ',
    other: '💳'
  };
  return icons[type] || '💳';
};

const getPaymentName = (type) => {
  const names = {
    wechat: '微信支付',
    alipay: '支付宝',
    usdt_trc20: 'USDT (TRC20)',
    bitcoin: 'Bitcoin',
    ethereum: 'Ethereum',
    other: '其他'
  };
  return names[type] || '其他';
};

const loadConfigs = async () => {
  try {
    loading.value = true;
    const result = await paymentsAPI.getConfigs(props.articleId);
    configs.value = result.configs || [];
  } catch (error) {
    console.error('加载支付配置失败:', error);
  } finally {
    loading.value = false;
  }
};

const showQRCode = (config) => {
  currentPayment.value = config;
  showQR.value = true;
};

const copyAddress = async () => {
  if (currentPayment.value?.address) {
    try {
      await navigator.clipboard.writeText(currentPayment.value.address);
      alert('地址已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
    }
  }
};

onMounted(() => {
  loadConfigs();
});
</script>

<style scoped>
.donation-section {
  margin-top: 3rem;
  padding: 2rem;
  background: rgba(15, 23, 42, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.donation-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 212, 255, 0.3);
}

.donation-title {
  margin: 0;
  color: var(--tech-primary);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
}

.loading {
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 212, 255, 0.3);
  border-top-color: var(--tech-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-config {
  text-align: center;
  padding: 2rem;
  color: var(--tech-text-muted);
}

.payment-methods {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.payment-item {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.payment-item:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: var(--tech-primary);
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
}

.payment-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.payment-info h4 {
  margin: 0 0 0.5rem 0;
  color: var(--tech-primary);
  font-family: 'Courier New', monospace;
}

.payment-info p {
  margin: 0;
  color: var(--tech-text-muted);
  font-size: 0.9rem;
  word-break: break-all;
}

.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(10px);
}

.qr-content {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  position: relative;
  text-align: center;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  color: var(--tech-text);
  font-size: 2rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(248, 113, 113, 0.2);
  color: #f87171;
}

.qr-content h3 {
  margin: 0 0 1.5rem 0;
  color: var(--tech-primary);
  font-family: 'Courier New', monospace;
}

.qr-image {
  width: 100%;
  max-width: 300px;
  border: 2px solid var(--tech-border);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.payment-address {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  color: var(--tech-text);
  font-size: 0.9rem;
}

.payment-address code {
  display: block;
  margin: 0.5rem 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  color: var(--tech-accent);
}

.copy-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid var(--tech-primary);
  border-radius: 6px;
  color: var(--tech-primary);
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
}

.copy-btn:hover {
  background: rgba(0, 212, 255, 0.3);
}
</style>

