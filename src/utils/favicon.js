import {
  faultedVolume,
  degradedVolume,
  inProgressVolume,
  downNode,
  unschedulableNode,
  autoEvictingNode,
} from './filter'

const ERROR_COLOR = '#F15354'
const WARNING_COLOR = '#F1C40F'
const HEALTHY_COLOR = '#27AE5F'

const ICON_SIZE = 64
const BORDER_COLOR = '#FFFFFF'

export function getClusterState(host, volume) {
  const hosts = (host && host.data) || []
  const volumes = (volume && volume.data) || []
  if (faultedVolume(volumes).length > 0 || downNode(hosts).length > 0) {
    return { color: ERROR_COLOR, state: 'error' }
  }
  if (degradedVolume(volumes).length > 0
    || inProgressVolume(volumes).length > 0
    || unschedulableNode(hosts).length > 0
    || autoEvictingNode(hosts).length > 0) {
    return { color: WARNING_COLOR, state: 'warning' }
  }
  return { color: HEALTHY_COLOR, state: 'healthy' }
}

function createBadgeCanvas(image, color) {
  const canvas = document.createElement('canvas')
  canvas.width = ICON_SIZE
  canvas.height = ICON_SIZE
  const ctx = canvas.getContext('2d')
  if (image) {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
  }
  // Draw the badge at the bottom-right corner with a small white border
  const radius = ICON_SIZE * 0.2
  const cx = canvas.width - radius - ICON_SIZE * 0.08
  const cy = canvas.height - radius - ICON_SIZE * 0.08
  ctx.beginPath()
  ctx.arc(cx, cy, radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.lineWidth = Math.max(1, ICON_SIZE * 0.05)
  ctx.strokeStyle = BORDER_COLOR
  ctx.stroke()
  return canvas.toDataURL()
}

function applyFavicon(dataUrl) {
  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = dataUrl
}

let cachedFaviconImage = null
let cachedClusterState = null

export function updateFavicon(host, volume) {
  const { color, state } = getClusterState(host, volume)
  // Skip redrawing when the cluster state has not changed
  if (state === cachedClusterState) {
    return
  }
  cachedClusterState = state

  if (cachedFaviconImage) {
    applyFavicon(createBadgeCanvas(cachedFaviconImage, color))
    return
  }

  const image = new Image()
  image.onload = () => {
    cachedFaviconImage = image
    applyFavicon(createBadgeCanvas(image, color))
  }
  // Fallback to a solid-color badge icon if the favicon fails to load
  image.onerror = () => {
    applyFavicon(createBadgeCanvas(null, color))
  }
  image.src = '/favicon.ico'
}