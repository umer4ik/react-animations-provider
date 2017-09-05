// @flow

type AnimationOptions = {
  onStart: () => void,
  onStop: () => void,
  draw: (progress: number) => void,
  duration: number,
  easing: (param: number) => number
}

type Result = {
  stop: () => void,
  progress: boolean
}

const defaultOptions = {
  onStop: () => {},
  onStart: () => {},
  draw: (progress) => {},
  duration: 1000,
  easing: t => t
}

export function animation (inputOptions: AnimationOptions): Result {
  const options: AnimationOptions = {
    ...defaultOptions,
    ...inputOptions
  }
  const result = {
    progress: false,
    stop () {
      this.progress = false
      options.onStop && options.onStop()
    },
    start () {
      options.onStart()
      let start = performance.now()
      this.progress = true
      let frame = requestAnimationFrame(function animate (time) {
        let timeFraction = (time - start) / options.duration
        if (timeFraction > 1) timeFraction = 1
        const progress = options.easing(timeFraction)
        if (timeFraction < 1 && result.progress) {
          options.draw(progress)
          frame = requestAnimationFrame(animate)
        } else {
          cancelAnimationFrame(frame)
          result.stop()
        }
      })
    }
  }
  return result
}
