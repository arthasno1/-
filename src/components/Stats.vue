<template>
  <section class="stats">
    <h2 class="section__title">今日收获</h2>

    <div class="stats__big">
      <span class="stats__num">{{ pomo.completedToday.value }}</span>
      <span class="stats__label">颗番茄</span>
    </div>

    <ul class="stats__list">
      <!-- 单个番茄为一组，统计用 -->
      <li class="stats__item">
        <span class="stats__tag">本轮</span>
        <span class="stats__value">{{ pomo.roundProgress.value }} / {{ pomo.LONG_BREAK_INTERVAL }}</span>
      </li>
      <li class="stats__item">
        <span class="stats__tag">阶段</span>
        <span class="stats__value">{{ pomo.MODE_LABEL[pomo.mode.value] }}</span>
      </li>
    </ul>

    <p class="stats__tip">集齐四枚，便得一段从容的长歇。</p>
  </section>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { pomodoroKey } from '../composables/usePomodoro'

/** 共享的番茄计时实例 */
const pomo = inject(pomodoroKey)!
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.stats {
  padding: 22px;
  background: $surface;
  border: 1px solid $line;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(44, 38, 32, 0.05);

  &__big {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 18px;
  }

  &__num {
    font-family: 'Noto Serif SC', serif;
    font-size: 3rem;
    font-weight: 700;
    color: $cinnabar;
    line-height: 1;
  }

  &__label {
    font-size: 0.8rem;
    color: $muted;
  }

  &__list {
    list-style: none;
    margin: 0 0 16px;
    padding: 0;
    display: grid;
    gap: 8px;
  }

  &__item {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-top: 1px solid $line;
  }

  &__tag {
    font-size: 0.75rem;
    color: $muted;
  }

  &__value {
    font-family: 'Noto Serif SC', serif;
    font-size: 0.88rem;
    color: $fg;
  }

  &__tip {
    font-size: 0.75rem;
    color: $muted;
    margin: 0;
    line-height: 1.6;
  }
}
</style>
