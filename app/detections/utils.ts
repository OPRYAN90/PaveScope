export function drawBoundingBoxes(imgElement: HTMLImageElement, detections: any[]): string {
  const canvas = document.createElement('canvas')
  canvas.width = imgElement.naturalWidth
  canvas.height = imgElement.naturalHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return imgElement.src

  ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height)

  const scaleFactor = Math.min(canvas.width, canvas.height) / 1000
  const fontSize = Math.max(12, Math.round(16 * scaleFactor))
  const padding = Math.round(4 * scaleFactor)
  const labelHeight = fontSize + padding * 2

  detections.forEach((detection) => {
    const { box, score } = detection
    if (!box || typeof score !== 'number') {
      console.warn('Invalid detection:', detection)
      return // Skip this detection
    }

    const { xmin, ymin, xmax, ymax } = box

    ctx.strokeStyle = 'red'
    ctx.lineWidth = Math.max(2, Math.round(2 * scaleFactor))
    ctx.strokeRect(xmin, ymin, xmax - xmin, ymax - ymin)

    const scoreText = score.toFixed(2)
    ctx.font = `bold ${fontSize}px Arial`
    const textWidth = ctx.measureText(scoreText).width

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.fillRect(xmin, ymin - labelHeight, textWidth + padding * 2, labelHeight)

    ctx.fillStyle = 'red'
    ctx.fillText(scoreText, xmin + padding, ymin - padding)
  })

  return canvas.toDataURL()
}