<template>
    <!-- 弹窗组件 -->
    <Teleport to="body">
        <Transition name="modal-fade">
            <div v-if="visible" class="custom-modal-overlay" @click="handleOverlayClick">
                <div class="custom-modal" @click.stop>
                    <!-- 头部 -->
                    <div class="modal-header">
                        <div class="modal-icon" :class="type">
                            <svg v-if="type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4M12 8h.01"/>
                            </svg>
                            <svg v-else-if="type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                            <svg v-else-if="type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                                <path d="M12 9v4M12 17h.01"/>
                            </svg>
                            <svg v-else-if="type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M15 9l-6 6M9 9l6 6"/>
                            </svg>
                        </div>
                        <h3 class="modal-title">{{ title }}</h3>
                    </div>

                    <!-- 内容 -->
                    <div class="modal-body">
                        <p>{{ message }}</p>
                    </div>

                    <!-- 底部按钮 -->
                    <div class="modal-footer">
                        <button class="modal-btn cancel-btn" @click="handleCancel">
                            {{ cancelButtonText }}
                        </button>
                        <button class="modal-btn confirm-btn" @click="handleConfirm">
                            {{ confirmButtonText }}
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '提示'
    },
    message: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        default: 'info', // info, success, warning, error
        validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
    },
    confirmButtonText: {
        type: String,
        default: '确定'
    },
    cancelButtonText: {
        type: String,
        default: '取消'
    }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const handleConfirm = () => {
    emit('confirm')
    emit('close')
}

const handleCancel = () => {
    emit('cancel')
    emit('close')
}

const handleOverlayClick = () => {
    emit('cancel')
    emit('close')
}

// ESC 键关闭
watch(() => props.visible, (newVal) => {
    if (newVal) {
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                handleCancel()
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }
})
</script>

<style scoped>
/* 遮罩层 */
.custom-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

/* 弹窗主体 */
.custom-modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    min-width: 400px;
    max-width: 500px;
    overflow: hidden;
    animation: modal-slide-in 0.3s ease-out;
}

@keyframes modal-slide-in {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* 头部 */
.modal-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 24px 16px;
}

.modal-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.modal-icon svg {
    width: 24px;
    height: 24px;
}

.modal-icon.info {
    background: #e3f2fd;
    color: #2196f3;
}

.modal-icon.success {
    background: #e8f5e9;
    color: #4caf50;
}

.modal-icon.warning {
    background: #fff3e0;
    color: #ff9800;
}

.modal-icon.error {
    background: #ffebee;
    color: #f44336;
}

.modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
}

/* 内容区 */
.modal-body {
    padding: 0 24px 24px;
    color: #666;
    font-size: 15px;
    line-height: 1.6;
}

.modal-body p {
    margin: 0;
}

/* 底部按钮 */
.modal-footer {
    display: flex;
    gap: 12px;
    padding: 16px 24px 24px;
    justify-content: flex-end;
}

.modal-btn {
    padding: 10px 24px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    font-weight: 500;
}

.cancel-btn {
    background: #f5f5f5;
    color: #666;
}

.cancel-btn:hover {
    background: #e0e0e0;
}

.confirm-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.confirm-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active .custom-modal {
    animation: modal-slide-in 0.3s ease-out;
}

.modal-fade-leave-active .custom-modal {
    animation: modal-slide-out 0.3s ease-in;
}

@keyframes modal-slide-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
    }
}
</style>
