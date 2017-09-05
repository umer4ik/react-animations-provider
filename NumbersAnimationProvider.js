import React, { Component } from 'react'
import { animation } from './utils/animate'
import ease from 'ease-component'

const numbersAnimationProvider = (WrappedComponent) => class extends Component {
  constructor (props, context, updater) {
    super(props, context, updater)
    if (!props.animate) {
      throw new Error('Provide animate prop to component')
    }
    const parsedAnimatedProps = this.getAnimatedPropsForState(props.animate)
    this.state = parsedAnimatedProps
    this.animations = {}
  }

  getAnimatedPropsForState (animate) {
    return Object.keys(animate).reduce((acc, propKey) => {
      const prop = animate[propKey]
      if (prop.to !== prop.from) {
        acc = {
          ...acc,
          [propKey]: prop.from
        }
      }
      return acc
    }, {})
  }

  createAnimation (key, animate) {
    return animation({
      draw: (progress) => {
        const value = ((progress * (animate[key].to - animate[key].from)) + animate[key].from)
        this.setState({
          [key]: animate[key].int
            ? Math.round(value)
            : value
        })
      },
      duration: animate[key].duration || 1000,
      easing: (() => {
        const inputEasing = animate[key].easing
        if (typeof inputEasing === 'string') {
          return ease[inputEasing]
        }
        if (typeof inputEasing === 'function') {
          return inputEasing
        }
        return ease.inOutSine
      })()
    })
  }

  addAnimation (key, animation) {
    this.animations[key] = animation
  }

  addAllAnimations (animate) {
    Object.keys(this.state).forEach((stateKey) => {
      const animation = this.createAnimation(stateKey, animate)
      this.addAnimation(stateKey, animation)
    })
  }

  runAnimation (key) {
    this.animations && this.animations[key] && this.animations[key].start()
  }

  runAllAnimations () {
    Object.keys(this.animations).forEach(animationKey => this.animations[animationKey].start())
  }

  clearAnimation (animationName) {
    this.animations[animationName] && this.animations[animationName].stop()
    delete this.animations[animationName]
  }

  clearAllAnimations () {
    Object.keys(this.animations).forEach(this.clearAnimation.bind(this))
  }

  getUpdatedAnimatedKeys (prevProps, nextProps) {
    const prevAnimate = prevProps.animate
    const nextAnimate = nextProps.animate
    return Object.keys(prevAnimate).reduce((acc, animateKey) => {
      const prevProp = prevAnimate[animateKey]
      const nextProp = nextAnimate[animateKey]
      if (prevProp.to !== nextProp.to) {
        acc.push(animateKey)
      }
      return acc
    }, [])
  }

  componentDidMount () {
    const { animate } = this.props
    this.addAllAnimations(animate)
    this.runAllAnimations()
  }

  componentWillReceiveProps (nextProps) {
    const keys = this.getUpdatedAnimatedKeys(this.props, nextProps)
    keys.forEach(key => {
      this.clearAnimation(key)
      const from = typeof this.state[key] !== 'undefined'
        ? this.state[key]
        : this.props.animate[key].to
      const animation = this.createAnimation(key, {
        ...nextProps.animate,
        [key]: {
          ...nextProps.animate[key],
          from
        }
      })
      this.addAnimation(key, animation)
      this.runAnimation(key)
    })
  }

  componentWillUnmount () {
    this.clearAllAnimations()
  }

  render () {
    return <WrappedComponent {...{...this.props, ...this.state}} />
  }
}

export default numbersAnimationProvider
