<template>
  <!-- 登录页面 -->
  <div class="container mx-auto px-4 py-20">
    <div class="max-w-md mx-auto card">
      <h2 class="text-2xl font-bold mb-6 text-center">管理员登录</h2>
      
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        
        <el-form-item label=" " class="flex justify-center">
          <el-button type="primary" @click="handleLogin" :loading="isLoading" class="w-full">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="text-center text-gray-500 mt-4">
        <p>测试账号：admin / 密码：123456</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { useRouter } from 'vue-router';

const router = useRouter();
const loginFormRef = ref<InstanceType<typeof ElForm> | null>(null);
const isLoading = ref(false);

// 登录表单数据
const loginForm = ref({
  username: '',
  password: ''
});

// 登录表单校验规则
const loginRules = ref({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6个字符', trigger: 'blur' }
  ]
});

// 登录处理函数
const handleLogin = async () => {
  try {
    // 表单校验
    await loginFormRef.value?.validate();
    isLoading.value = true;
    
    // 模拟登录请求延迟
    setTimeout(() => {
      // 简单的登录验证（实际项目中应调用后端接口）
      if (loginForm.value.username === 'admin' && loginForm.value.password === '123456') {
        // 登录成功，存储登录状态
        localStorage.setItem('isLoggedIn', 'true');
        ElMessage.success('登录成功');
        // 跳转到首页或之前的页面
        router.push('/');
      } else {
        ElMessage.error('用户名或密码错误');
      }
      isLoading.value = false;
    }, 800);
  } catch (error) {
    console.error('登录表单校验失败:', error);
  }
};
</script>