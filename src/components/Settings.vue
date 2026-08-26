<template>
  <section class="settings">
    <h2 class="section__title">自定义时长</h2>
    <div class="settings__row">
      <label v-for="field in fields" :key="field.key" class="settings__field">
        <span class="settings__name">{{ field.label }}</span>
        <input
          v-model.number="pomo.durations.value[field.key]"
          type="number"
          min="1"
          max="120"
          class="settings__input"
          @change="apply"
        />
        <span class="settings__unit">分</span>
      </label>
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { pomodoroKey, type PomodoroMode } from '../composables/usePomodoro'

/** 可配置的时长字段 */
interface DurationField {
  /** 对应模式 */
  key: PomodoroMode
  /** 展示名称 */
  label: string
}

/** 三个时长输入项 */
const fields: DurationField[] = [
  { key: 'work', label: '专注' },
  { key: 'short', label: '短休' },
  { key: 'long', label: '长休' }
]

/** 共享的番茄计时实例 */
const pomo = inject(pomodoroKey)!

/**
 * 应用时长改动：若当前阶段未运行，则把剩余时间刷新为新的满时长
 */
const apply = (): void => {
  const m = pomo.mode.value
  const minutes = pomo.durations.value[m]
  if (!pomo.running.value && minutes > 0) {
    pomo.remaining.value = minutes * 60
  }
}
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.settings {
  padding: 22px;
  background: $surface;
  border: 1px solid $line;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(44, 38, 32, 0.05);

  &__row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__name {
    font-size: 0.72rem;
    color: $muted;
    letter-spacing: 1px;
  }

  &__input {
    width: 100%;
    font-family: 'Noto Serif SC', serif;
    font-size: 1.1rem;
    font-weight: 700;
    text-align: center;
    color: $fg;
    background: rgba(44, 38, 32, 0.04);
    border: 1px solid $line;
    border-radius: 6px;
    padding: 10px 6px;
    outline: none;
    transition: border-color 0.2s;

    &:focus {
      border-color: $cinnabar;
    }

    // 去除 number 输入默认的上下箭头，保持干净
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      appearance: none;
      margin: 0;
    }
  }

  &__unit {
    font-size: 0.68rem;
    color: $muted;
    text-align: right;
  }
}
</style>
