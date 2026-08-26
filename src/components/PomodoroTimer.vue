<template>
  <section class="timer" aria-label="番茄计时器">
    <div class="timer__scene">
      <svg class="timer__dial" viewBox="0 0 300 300" role="img" :aria-label="`剩余 ${pomo.formatted.value}`">
        <!-- 底环：淡墨 -->
        <circle class="timer__track" cx="150" cy="150" r="124" />
        <!-- 进度环：随时间「落笔」填满，像一枚逐渐成型的印 -->
        <circle
          class="timer__progress"
          cx="150"
          cy="150"
          r="124"
          :style="{ stroke: modeColor, strokeDasharray: CIRCUMFERENCE, strokeDashoffset: offset }"
        />
      </svg>

      <!-- 中央信息 -->
      <div class="timer__mid">
        <span class="timer__mode" :style="{ color: modeColor }">{{ pomo.MODE_LABEL[pomo.mode.value] }}</span>
        <span class="timer__time">{{ pomo.formatted.value }}</span>
        <div class="timer__dots">
          <span v-for="n in pomo.LONG_BREAK_INTERVAL" :key="n" class="timer__dot" :class="{ 'is-done': pomo.roundProgress.value >= n }" />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { pomodoroKey, type PomodoroMode } from '../composables/usePomodoro'

/** 圆环半径 */
const RADIUS = 124
/** 圆环周长 */
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** 各模式对应的主色（宋式：朱砂/天青/亚金） */
const MODE_COLOR: Record<PomodoroMode, string> = {
  work: '#b0332a',
  short: '#7fa39b',
  long: '#b7976a'
}

/** 共享的番茄计时实例 */
const pomo = inject(pomodoroKey)!

/** 当前模式主色 */
const modeColor = computed(() => MODE_COLOR[pomo.mode.value])

/** 进度环偏移：progress 增大时环填满 */
const offset = computed(() => CIRCUMFERENCE * (1 - pomo.progress.value))
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.timer {
  &__scene {
    position: relative;
    width: min(340px, 78vw);
    aspect-ratio: 1;
    margin: 0 auto;
    // 水墨淡晕
    background: radial-gradient(circle at 50% 44%, rgba(176, 51, 42, 0.08), transparent 62%);
    display: grid;
    place-items: center;
  }

  &__dial {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
    // 缓慢「呼吸」
    animation: breathe 10s ease-in-out infinite;
  }

  &__track {
    fill: none;
    stroke: rgba(44, 38, 32, 0.1);
    stroke-width: 9;
  }

  &__progress {
    fill: none;
    stroke-width: 9;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.35s ease;
  }

  &__mid {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  &__mode {
    font-family: 'Noto Serif SC', serif;
    font-size: 0.86rem;
    letter-spacing: 8px;
    text-transform: uppercase;
    font-weight: 600;
  }

  &__time {
    font-family: 'Noto Serif SC', serif;
    font-size: clamp(3rem, 12vw, 4.2rem);
    font-weight: 700;
    line-height: 1;
    color: $fg;
    // 墨字微染朱砂光
    text-shadow: 0 0 22px rgba(176, 51, 42, 0.22);
  }

  &__dots {
    display: flex;
    gap: 10px;
    margin-top: 8px;
  }

  // 印章式小方点
  &__dot {
    width: 12px;
    height: 12px;
    border: 1px solid rgba(44, 38, 32, 0.25);
    border-radius: 3px;
    background: transparent;
    transition:
      background 0.3s,
      border-color 0.3s,
      transform 0.3s;

    &.is-done {
      background: $cinnabar;
      border-color: $cinnabar;
      transform: scale(1.15);
      box-shadow: 0 0 8px rgba(176, 51, 42, 0.45);
    }
  }
}

@keyframes breathe {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.03);
  }
}

// 尊重系统「减少动效」设置
@media (prefers-reduced-motion: reduce) {
  .timer__dial {
    animation: none;
  }
  .timer__progress {
    transition: none;
  }
}
</style>
