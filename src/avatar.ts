import { Content, Container, Skin, Texture, Behavior } from 'piu/MC'

const AVATAR_COLOR_FG = 'white'
const AVATAR_COLOR_BG = 'black'
const NAME_LEFTEYE = 'leftEye'
const NAME_RIGHTEYE = 'rightEye'
const NAME_MOUTH = 'mouth'
const NAME_IRIS = 'iris'
const NAME_EYELID = 'eyelid'

var normRand = function(m: number, s: number): number {
  var a = 1 - Math.random()
  var b = 1 - Math.random()
  var c = Math.sqrt(-2 * Math.log(a))
  if (0.5 - Math.random() > 0) {
    return c * Math.sin(Math.PI * 2 * b) * s + m
  } else {
    return c * Math.cos(Math.PI * 2 * b) * s + m
  }
}

const AvatarIrisSkinTexture = Texture.template({
  path: 'eyes-alpha.bmp',
})

const AvatarIrisSkin = Skin.template({
  Texture: AvatarIrisSkinTexture,
  width: 16,
  height: 16,
  variants: 16,
  states: 16,
  color: AVATAR_COLOR_FG,
})

interface FaceContext {
  gaze: {
    x: number
    y: number
  }
  eyeOpen: number
  mouthOpen: number
  breath: number
}

interface Intervals {
  gazeInterval: number
  blinkInterval: number
}

const AvatarIris = Content.template(({ top, right, bottom, left, x, y, name }) => ({
  top,
  right,
  bottom,
  left,
  x,
  y,
  name,
  width: 16,
  height: 16,
  skin: new AvatarIrisSkin(),
}))

const AvatarEyelidSkinTexture = Texture.template({
  path: 'eyelid-alpha.bmp',
})

const AvatarEyelidSkin = Skin.template({
  Texture: AvatarEyelidSkinTexture,
  width: 24,
  height: 24,
  variants: 24,
  states: 24,
  color: AVATAR_COLOR_BG,
})

const AvatarEyelid = Content.template(({ top, right, bottom, left, x, y, name }) => ({
  top,
  right,
  bottom,
  left,
  x,
  y,
  name,
  width: 24,
  height: 24,
  interval: 40,
  duration: 40 * 7,
  skin: new AvatarEyelidSkin(),
  Behavior: class extends Behavior {
    onTimeChanged(content: Content) {
      let v = Math.floor(content.fraction * 6)
      content.variant = v
    }
    onFinished(content: Content) {
      content.time = 0
    }
    onUpdate(content: OffsetContainer) {
      const ctx = content.props
    }
  },
}))

const AvatarEye = Container.template(({ top, right, bottom, left, x, y, width, height, name }) => ({
  top,
  right,
  bottom,
  left,
  x,
  y,
  width,
  height,
  name,
  clip: true,
  contents: [
    new AvatarIris({
      top: 3,
      left: 3,
      name: NAME_IRIS,
    }),
    new AvatarEyelid({
      top: 0,
      left: 0,
      name: NAME_EYELID,
    }),
  ],
  Behavior: class extends Behavior {
    onDisplaying(container: OffsetContainer) {
      container.originalPosition = new Map()
      // TODO: make smart
      const iris = container.content(NAME_IRIS)
      if (iris != null) {
        container.originalPosition.set(iris, {
          top: iris.y,
          left: iris.x,
        })
      }
    }
    onBlink(container: Container) {
      container.content(NAME_EYELID).start()
    }
    onGazeChange(container: OffsetContainer, gaze: { x: number; y: number }) {
      const iris = container.content(NAME_IRIS)
      const origPos = container.originalPosition.get(iris)
      if (origPos != null) {
        iris.x = origPos.left + gaze.x * 3
        iris.y = origPos.top + gaze.y * 3
      }
    }
  },
}))

const AvatarMouthSkinTexture = Texture.template({
  path: 'mouth-alpha.bmp',
})

const AvatarMouthSkin = Skin.template({
  Texture: AvatarMouthSkinTexture,
  width: 80,
  height: 40,
  variants: 80,
  states: 40,
  color: AVATAR_COLOR_FG,
})

const AvatarMouth = Content.template(({ top, right, bottom, left, x, y, name }) => ({
  top,
  right,
  bottom,
  left,
  x,
  y,
  name,
  width: 80,
  height: 40,
  // loop: true,
  duration: 60 * 6,
  interval: 60,
  loop: true,
  skin: new AvatarMouthSkin(),
  Behavior: class extends Behavior {
    onTimeChanged(content: Content) {
      let v = Math.floor(content.fraction * 10)
      if (v > 5) {
        v = 10 - v
      }
      content.variant = v
    }
    onFinished(content: Content) {
      content.time = 0
    }
    onUpdate(content: OffsetContainer) {
      const ctx = content.props
    }
  },
}))

interface OffsetContainerProps extends Intervals, FaceContext {}
interface OffsetContainer extends Container {
  originalPosition: Map<Content, { top: number; left: number }>
  props: OffsetContainerProps
}

const Avatar = Container.template(({ top, right, bottom, left, x, y, width, height }) => ({
  top,
  right,
  bottom,
  left,
  x,
  y,
  width,
  height,
  skin: new Skin({
    fill: 'black',
  }),
  contents: [
    new AvatarEye({
      left: 82,
      top: 85,
      name: NAME_LEFTEYE,
    }),
    new AvatarEye({
      left: 222,
      top: 88,
      name: NAME_RIGHTEYE,
    }),
    new AvatarMouth({
      left: 123,
      top: 128,
      name: NAME_MOUTH,
    }),
  ],
  interval: 33,
  duration: 330 * 9,
  loop: true,
  Behavior: class extends Behavior {
    onDisplaying(container: OffsetContainer) {
      container.originalPosition = new Map()
      // TODO: make smart
      const leftEye = container.content(NAME_LEFTEYE)
      if (leftEye != null) {
        container.originalPosition.set(leftEye, {
          top: leftEye.y,
          left: leftEye.x,
        })
      }
      const rightEye = container.content(NAME_RIGHTEYE)
      if (rightEye != null) {
        container.originalPosition.set(rightEye, {
          top: rightEye.y,
          left: rightEye.x,
        })
      }
      const mouth = container.content(NAME_MOUTH)
      if (mouth != null) {
        container.originalPosition.set(mouth, {
          top: mouth.y,
          left: mouth.x,
        })
      }
      container.props = {
        gaze: {
          x: 0,
          y: 0,
        },
        breath: 3,
        eyeOpen: 0,
        mouthOpen: 0,
        gazeInterval: 4000,
        blinkInterval: 4000,
      }
      container.start()
      mouth.start()
    }
    onBleath(container: OffsetContainer, breath: number) {
      const offsetY = 3 * breath
      for (let i = 0; i < 3; i++) {
        const c = container.content(i)
        const origPos = container.originalPosition.get(c)
        if (origPos != null) {
          c.y = origPos.top + offsetY
        }
      }
    }
    onTimeChanged(container: OffsetContainer) {
      const f = container.fraction

      // update gaze
      container.props.gazeInterval -= container.interval
      if (container.props.gazeInterval < 0) {
        container.props.gaze.x = Math.random() * 2 - 1
        container.props.gaze.y = Math.random() * 2 - 1
        container.content(NAME_LEFTEYE).delegate('onGazeChange', container.props.gaze)
        container.content(NAME_RIGHTEYE).delegate('onGazeChange', container.props.gaze)
        container.props.gazeInterval = normRand(3000, 3000) + 1000
      }

      // update blink
      container.props.blinkInterval -= container.interval
      if (container.props.blinkInterval < 0) {
        container.content(NAME_LEFTEYE).delegate('onBlink')
        container.content(NAME_RIGHTEYE).delegate('onBlink')
        container.props.blinkInterval = normRand(2000, 2000) + 1000
      }

      // update breath
      const breath = Math.sin(f * 2 * Math.PI)
      this.onBleath(container, breath)
    }
  },
}))

export default Avatar
