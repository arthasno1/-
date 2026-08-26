<template>
  <div class="app">
    <!-- 顶部：竖排品牌 + 朱砂印章 -->
    <header class="app__masthead">
      <div class="app__brand">
        <span class="app__seal" aria-hidden="true">专注</span>
        <div class="app__title">
          <span class="app__logo">番茄·专注所</span>
          <span class="app__sub">POMO GARDEN · 宋韵计时</span>
        </div>
      </div>
      <button class="app__notice" @click="pomo.requestNotify()">开启通知</button>
    </header>

    <!-- 主体：左侧计时器 + 右侧控制面板 -->
    <main class="app__body">
      <div class="app__stage">
        <PomodoroTimer />
      </div>
      <aside class="app__panel">
        <Controls />
        <Stats />
        <Settings />
      </aside>
    </main>

    <footer class="app__foot">一炷香，一盏茶，专注亦可成气候。</footer>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import PomodoroTimer from './components/PomodoroTimer.vue'
import Controls from './components/Controls.vue'
import Stats from './components/Stats.vue'
import Settings from './components/Settings.vue'
import { usePomodoro, pomodoroKey } from './composables/usePomodoro'

/** 整个页面的番茄计时实例，provide 给所有子组件共享 */
const pomo = usePomodoro()
provide(pomodoroKey, pomo)
</script>

<style scoped lang="scss">
@use './styles/variables.scss' as *;

.app {
  min-height: 100vh;
  max-width: 1080px;
  margin: 0 auto;
  padding: 32px 40px 48px;
  // 宣纸质感 + 淡墨晕染
  background:
    radial-gradient(900px 460px at 12% -6%, rgba(199, 148, 96, 0.16), transparent 60%),
    radial-gradient(760px 420px at 96% 8%, rgba(127, 163, 155, 0.16), transparent 60%),
    $bg;

  &__masthead {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 24px;
    border-bottom: 1px solid $line;
  }

  &__brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  // 朱砂印章
  &__seal {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    background: $cinnabar;
    color: #fdf8ef;
    font-family: 'Noto Serif SC', serif;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.15;
    text-align: center;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(176, 51, 42, 0.3);
  }

  &__title {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__logo {
    font-family: 'Noto Serif SC', serif;
    font-size: 1.35rem;
    font-weight: 700;
    letter-spacing: 6px;
    color: $fg;
  }

  &__sub {
    font-size: 0.72rem;
    color: $muted;
    letter-spacing: 3px;
  }

  &__notice {
    font-family: inherit;
    font-size: 0.75rem;
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
  }

  &__body {
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 32px;
    align-items: start;
    padding: 40px 0;
  }

  &__stage {
    position: sticky;
    top: 40px;
  }

  &__panel {
    display: grid;
    gap: 20px;
  }

  &__foot {
    text-align: center;
    font-family: 'Noto Serif SC', serif;
    font-size: 0.78rem;
    color: $muted;
    letter-spacing: 3px;
    border-top: 1px solid $line;
    padding-top: 24px;
  }
}

// 小屏幕适配：单列堆叠
@media (max-width: 860px) {
  .app {
    padding: 24px 18px 40px;

    &__body {
      grid-template-columns: 1fr;
      padding: 28px 0;
    }

    &__stage {
      position: static;
    }
  }
}
</style>
