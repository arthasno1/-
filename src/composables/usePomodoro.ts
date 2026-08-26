import { ref, computed, watch, onUnmounted, type InjectionKey } from 'vue'

/** 番茄钟阶段模式 */
export type PomodoroMode = 'work' | 'short' | 'long'

/** 用于 provide/inject（跨组件注入）共享同一计时实例的 key */
export const pomodoroKey: InjectionKey<ReturnType<typeof usePomodoro>> = Symbol('pomodoro')

/** 每个阶段对应的一轮时长（分钟） */
export interface ModeDurations {
  /** 专注时长（分钟） */
  work: number
  /** 短休时长（分钟） */
  short: number
  /** 长休时长（分钟） */
  long: number
}

/** 每完成几个番茄进入一次长休 */
const LONG_BREAK_INTERVAL = 4

/** 模式对应的中文标签 */
const MODE_LABEL: Record<PomodoroMode, string> = {
  work: '专注',
  short: '短休',
  long: '长休'
}

/**
 * 番茄计时核心逻辑
 * 负责：模式切换、剩余时间、开始/暂停/重置、自动轮转、音效、今日统计、标签栏显示
 */
export function usePomodoro() {
  // 各模式时长（分钟），可被设置面板修改
  const durations = ref<ModeDurations>({ work: 25, short: 5, long: 15 })
  /** 当前阶段模式 */
  const mode = ref<PomodoroMode>('work')
  /** 剩余秒数 */
  const remaining = ref<number>(durations.value.work * 60)
  /** 是否运行中 */
  const running = ref<boolean>(false)
  /** 今日已完成番茄数 */
  const completedToday = ref<number>(0)
  /** 本轮累计番茄数（到 LONG_BREAK_INTERVAL 进长休） */
  const cycle = ref<number>(0)
  /** 音效开关 */
  const soundOn = ref<boolean>(true)

  /** 定时器 @type {ReturnType<typeof setInterval> | null} */
  let ticker: ReturnType<typeof setInterval> | null = null
  /** 本次运行开始的时间戳（毫秒） */
  let startAt = 0
  /** 本次运行时剩余秒数（用于按真实时间计算） */
  let startRemaining = 0
  /** Web Audio（网页音频）上下文 用于播放提示音 @type {AudioContext | null} */
  let audioCtx: AudioContext | null = null

  /** 当前阶段总秒数（用于算进度） */
  const totalSeconds = computed(() => durations.value[mode.value] * 60)
  /** 进度（0~1，0 刚开局，1 完成） */
  const progress = computed(() => (totalSeconds.value > 0 ? (totalSeconds.value - remaining.value) / totalSeconds.value : 0))
  /** 剩余时间格式化为 mm:ss */
  const formatted = computed(() => {
    const m = Math.floor(remaining.value / 60)
    const s = remaining.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  /** 本轮已完成的番茄数（0~LONG_BREAK_INTERVAL），长休时显示满格，避免一直累加 */
  const roundProgress = computed(() => (mode.value === 'long' ? LONG_BREAK_INTERVAL : cycle.value % LONG_BREAK_INTERVAL))

  /** 当前模式的时长（分钟），设置面板用 */
  const currentMinutes = computed(() => durations.value[mode.value])

  /** 停止定时器 */
  const stopTicker = (): void => {
    if (ticker) {
      clearInterval(ticker)
      ticker = null
    }
  }

  /** 按真实时间推进：每 250ms 校正一次剩余秒数，后台标签页也不走偏 */
  const tick = (): void => {
    const elapsed = Math.floor((Date.now() - startAt) / 1000)
    const left = startRemaining - elapsed
    if (left <= 0) {
      remaining.value = 0
      finish()
      return
    }
    remaining.value = left
  }

  /** 一个阶段自然结束：提示 + 自动进入下一阶段并暂停 */
  const finish = (): void => {
    stopTicker()
    running.value = false
    playChime()
    notify()
    if (mode.value === 'work') {
      completedToday.value += 1
      cycle.value += 1
    }
    const target = nextModeAfter(mode.value, cycle.value)
    mode.value = target
    remaining.value = durations.value[target] * 60
  }

  /** 计算某阶段结束后应进入的阶段 */
  const nextModeAfter = (cur: PomodoroMode, doneInCycle: number): PomodoroMode => {
    if (cur === 'work') {
      return doneInCycle % LONG_BREAK_INTERVAL === 0 ? 'long' : 'short'
    }
    return 'work'
  }

  /** 开始计时 */
  const start = (): void => {
    if (ticker) return
    running.value = true
    startAt = Date.now()
    startRemaining = remaining.value
    ticker = setInterval(tick, 250)
  }

  /** 暂停计时 */
  const pause = (): void => {
    stopTicker()
    running.value = false
  }

  /** 重置当前阶段剩余时间到满 */
  const reset = (): void => {
    stopTicker()
    running.value = false
    remaining.value = durations.value[mode.value] * 60
  }

  /** 切换阶段：停止计时并重置该阶段时长 */
  const switchMode = (m: PomodoroMode): void => {
    stopTicker()
    running.value = false
    mode.value = m
    remaining.value = durations.value[m] * 60
  }

  /** 播放提示音（合成三段短音） @param force 忽略音效开关直接播放（用于试听） */
  const playChime = (force = false): void => {
    if (!soundOn.value && !force) return
    try {
      // 兼容旧浏览器：优先标准 AudioContext，退化为 webkitAudioContext
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctx) return
      audioCtx = audioCtx ?? new Ctx()
      const ctx = audioCtx
      const now = ctx.currentTime
      // 三段上扬提示音
      ;[784, 988, 1319].forEach((freq, i) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, now + i * 0.18)
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.18 + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.18)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + i * 0.18)
        osc.stop(now + i * 0.18 + 0.2)
      })
    } catch {
      // 音频不可用时静默忽略
    }
  }

  /** 请求通知权限（浏览器允许才弹） */
  const requestNotify = async (): Promise<void> => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  /** 阶段结束时弹一条桌面通知 */
  const notify = (): void => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification(`阶段结束 · ${MODE_LABEL[mode.value]}`, {
      body: `接下来进入 ${MODE_LABEL[nextModeAfter(mode.value, cycle.value)]}`
    })
  }

  /** 更新浏览器标签栏标题，显示剩余时间 */
  const updateTitle = (): void => {
    const icon = running.value ? '▶' : '⏸'
    document.title = `${icon} ${formatted.value} · ${MODE_LABEL[mode.value]} · POMO GARDEN`
  }

  // 剩余时间/模式/运行状态变化时刷新标签栏标题
  watch([remaining, mode, running], updateTitle)

  onUnmounted(stopTicker)

  return {
    durations,
    mode,
    remaining,
    running,
    completedToday,
    cycle,
    roundProgress,
    soundOn,
    totalSeconds,
    progress,
    formatted,
    currentMinutes,
    LONG_BREAK_INTERVAL,
    MODE_LABEL,
    start,
    pause,
    reset,
    switchMode,
    requestNotify,
    updateTitle,
    playChime
  }
}
