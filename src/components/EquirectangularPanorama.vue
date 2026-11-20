<script setup lang="ts">
import { onBeforeUnmount, ref, watchEffect } from 'vue'

const props = defineProps<{
  src: string; alt: string; width: number; height: number
  yaw: number; vertical: number; zoom: number; sweep: number; horizon: number
}>()
const canvas = ref<HTMLCanvasElement>()
const image = ref<HTMLImageElement>()
const revision = ref(0)
function loaded(event: Event) {
  image.value = event.target as HTMLImageElement
  revision.value++
}

let renderGpu: ReturnType<typeof createRenderer> | undefined

function createRenderer(target: HTMLCanvasElement) {
  const gl = target.getContext('webgl', { alpha: false, antialias: false })
  if (!gl) return null
  const program = gl.createProgram()!
  for (const [kind, code] of [
    [gl.VERTEX_SHADER, `attribute vec2 position;
      varying vec2 uv;
      void main() { uv = position * vec2(.5, -.5) + .5; gl_Position = vec4(position, 0., 1.); }`],
    [gl.FRAGMENT_SHADER, `precision highp float;
      varying vec2 uv;
      uniform sampler2D photo;
      uniform vec4 view;
      uniform vec3 geometry;
      void main() {
        float ray = (uv.x - .5) * view.x;
        float screenY = (uv.y - .5) * view.w;
        float depth = cos(view.z) - screenY * sin(view.z);
        float down = sin(view.z) + screenY * cos(view.z);
        float u = .5 + (view.y + atan(ray, depth)) / geometry.x;
        float x = geometry.x > 3.142 ? fract(u) : clamp(u, 0., 1.);
        float y = geometry.y + atan(down, length(vec2(ray, depth))) / geometry.z;
        gl_FragColor = texture2D(photo, vec2(x, y));
      }`],
  ] as const) {
    const shader = gl.createShader(kind)!
    gl.shaderSource(shader, code)
    gl.compileShader(shader)
    gl.attachShader(program, shader)
    gl.deleteShader(shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
  gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
  for (const param of [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T]) gl.texParameteri(gl.TEXTURE_2D, param, gl.CLAMP_TO_EDGE)
  for (const param of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D, param, gl.LINEAR)
  const view = gl.getUniformLocation(program, 'view')
  const geometry = gl.getUniformLocation(program, 'geometry')
  const max = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number
  let uploaded = -1
  return (source: HTMLImageElement, version: number, spread: number, heading: number, centre: number, span: number, field: number, sweep: number, horizon: number) => {
    if (uploaded !== version) {
      let texture: HTMLImageElement | HTMLCanvasElement = source
      if (Math.max(source.naturalWidth, source.naturalHeight) > max) {
        const scale = max / Math.max(source.naturalWidth, source.naturalHeight)
        texture = document.createElement('canvas')
        texture.width = Math.max(1, Math.floor(source.naturalWidth * scale))
        texture.height = Math.max(1, Math.floor(source.naturalHeight * scale))
        texture.getContext('2d')!.drawImage(source, 0, 0, texture.width, texture.height)
      }
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture)
      uploaded = version
    }
    gl.viewport(0, 0, target.width, target.height)
    gl.uniform4f(view, spread, heading, centre, span)
    gl.uniform3f(geometry, sweep, horizon, field)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }
}

let drawFrame = 0
let pendingDraw: (() => void) | undefined
onBeforeUnmount(() => cancelAnimationFrame(drawFrame))

watchEffect(() => {
  const version = revision.value
  if (!version) return
  const source = image.value
  const target = canvas.value
  if (!source?.complete || !source.naturalWidth || !target || !props.width || !props.height) return
  const w = Math.min(1920, Math.ceil(props.width * devicePixelRatio))
  const h = Math.max(1, Math.round(w * props.height / props.width))
  const yaw = props.yaw
  const vertical = props.vertical
  const { zoom, sweep, horizon } = props
  // Keep the scheduled frame and replace only its input. Cancelling it on
  // every update can starve rendering during a wheel zoom animation.
  pendingDraw = () => draw(target, source, version, w, h, yaw, vertical, zoom, sweep, horizon)
  if (!drawFrame) {
    drawFrame = requestAnimationFrame(() => {
      drawFrame = 0
      pendingDraw?.()
      pendingDraw = undefined
    })
  }
}, { flush: 'post' })

function draw(target: HTMLCanvasElement, source: HTMLImageElement, version: number,
  w: number, h: number, yaw: number, vertical: number, zoom: number, sweep: number, horizon: number) {
  if (target.width !== w) target.width = w
  if (target.height !== h) target.height = h
  const wraps = sweep > Math.PI
  // Equirectangular stitches store latitude, not height on a cylinder.
  const field = Math.min(Math.PI - 0.01, sweep * source.height / source.width)
  const topAngle = -horizon * field
  const bottomAngle = (1 - horizon) * field
  // Open at up to ~115° horizontally without exposing empty space above
  // or below the stitch in taller viewports.
  const focal = Math.max(w / 3.2, h / (2 * Math.tan(field / 2))) * zoom
  const span = h / focal
  const halfAngle = Math.atan(span / 2)
  const minPitch = topAngle + halfAngle
  const maxPitch = Math.max(minPitch, bottomAngle - halfAngle)
  const restPitch = Math.min(maxPitch, Math.max(minPitch, 0.15))
  // The drag fraction can reach either end as soon as zoom exceeds fit.
  // Open up the pitch range gradually so the first zoom frame stays centred.
  const pitchRange = Math.min(1, (zoom - 1) / 0.3)
  const pitchOffset = Math.max(-1, Math.min(1, 2 * vertical - 1))
  const centre = restPitch + pitchOffset * pitchRange * (
    pitchOffset < 0 ? restPitch - minPitch : maxPitch - restPitch
  )
  const sin = Math.sin(centre)
  const cos = Math.cos(centre)
  const edge = Math.atan2(w / (2 * focal), cos - span / 2 * Math.abs(sin))
  const heading = (yaw - 0.5) * (wraps ? sweep : Math.max(0, sweep - 2 * edge))
  const latitude = (ray: number, y: number) => (horizon + Math.atan2(sin + y * cos, Math.hypot(ray, cos - y * sin)) / field) * source.height
  if (renderGpu === undefined) renderGpu = createRenderer(target)
  if (renderGpu) {
    renderGpu(source, version, w / focal, heading, centre, span, field, sweep, horizon)
    return
  }
  const ctx = target.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, w, h)
  for (let x = 0; x < w; x++) {
    const ray = (x + 0.5 - w / 2) / focal
    const u = 0.5 + (heading + Math.atan2(ray, cos)) / sweep
    const sx = (wraps ? u - Math.floor(u) : Math.max(0, Math.min(1, u))) * source.width
    const top = latitude(ray, -span / 2)
    const bottom = latitude(ray, span / 2)
    ctx.drawImage(source, Math.max(0, Math.min(source.width - 1, sx - 0.5)),
      top, 1, bottom - top, x, 0, 1, h)
  }
}
</script>

<template>
  <img :key="src" :src="src" alt="" hidden @load="loaded" />
  <canvas ref="canvas" role="img" :aria-label="alt" />
</template>

<style scoped>
canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
</style>
