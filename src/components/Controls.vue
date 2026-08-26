<template>
  <section class="controls">
    <!-- 模式切换 -->
    <div class="controls__modes" role="tablist" aria-label="切换阶段">
      <button
        v-for="(label, m) in pomo.MODE_LABEL"
        :key="m"
        class="controls__mode"
        :class="{ 'is-active': pomo.mode.value === m }"
        :role="'tab'"
        :aria-selected="pomo.mode.value === m"
        @click="pomo.switchMode(m as PomodoroMode)"
      >
        {{ label }}
      </button>
    </div>

    <!-- 开始/暂停 + 重置 -->
    <div class="controls__actions">
      <button class="controls__play" :class="{ 'is-running': pomo.running.value }" @click="toggle">
        {{ pomo.running.value ? '暂停' : '开始' }}
      </button>
      <button class="controls__reset" aria-label="重置当前阶段" @click="pomo.reset()">重置</button>
    </div>

    <!-- 音效开关 + 试听 -->
    <div class="controls__soundbox">
      <button class="controls__sound" :aria-pressed="pomo.soundOn.value" @click="pomo.soundOn.value = !pomo.soundOn.value">
        <span v-if="pomo.soundOn.value" aria-hidden="true">♪</span>
        <span v-else aria-hidden="true">♪̶</span>
        {{ pomo.soundOn.value ? '音效开' : '音效关' }}
      </button>
      <button class="controls__sound controls__sound--test" @click="pomo.playChime(true)">试听</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import { pomodoroKey, type PomodoroMode } from '../composables/usePomodoro'

/** 共享的番茄计时实例 */
const pomo = inject(pomodoroKey)!

/** 开始/暂停切换 */
const toggle = (): void => {
  if (pomo.running.value) {
    pomo.pause()
  } else {
    pomo.start()
  }
}
</script>

<style scoped lang="scss">
@use '../styles/variables.scss' as *;

.controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 22px;
  background: $surface;
  border: 1px solid $line;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(44, 38, 32, 0.05);

  &__modes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    background: rgba(44, 38, 32, 0.05);
    padding: 5px;
    border-radius: 6px;
  }

  &__mode {
    font-family: inherit;
    font-size: 0.82rem;
    letter-spacing: 1px;
    padding: 10px 0;
    border: none;
    background: transparent;
    color: $muted;
    cursor: pointer;
    border-radius: 4px;
    transition:
      background 0.2s,
      color 0.2s;

    &.is-active {
      background: $cinnabar;
      color: #fdf8ef;
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
  }

  &__play {
    flex: 1;
    padding: 16px 0;
    font-family: 'Noto Serif SC', serif;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 4px;
    background: $cinnabar;
    color: #fdf8ef;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(176, 51, 42, 0.25);

    &.is-running {
      background: $celadon;
      color: #2c2620;
    }
  }

  &__reset {
    padding: 16px 22px;
    font-size: 0.9rem;
    background: transparent;
    color: $muted;
    border: 1px solid $line;
    border-radius: 6px;

    &:hover {
      color: $fg;
      border-color: $cinnabar;
    }
  }

  &__soundbox {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  &__sound {
    font-family: inherit;
    font-size: 0.8rem;
    padding: 8px 14px;
    background: transparent;
    color: $muted;
    border: 1px solid $line;
    border-radius: 4px;
    cursor: pointer;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: $fg;
      border-color: $cinnabar;
    }

    &--test {
      color: $cinnabar;
      border-color: rgba(176, 51, 42, 0.4);
    }
  }
}
</style>
