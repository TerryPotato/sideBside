// Reduce una foto antes de mandarla a leer con IA. Una foto de celular pesa
// 3-8 MB (a veces mas que el limite de 5 MB del servidor) y subirla con
// datos moviles es buena parte de la espera; a 1600 px el texto de un ticket
// se sigue leyendo igual y el archivo baja a ~200-400 KB.
// Si no es imagen (PDF) o algo falla, regresa el archivo original.
export async function reducirImagen(file, maxLado = 1600, calidad = 0.85) {
  if (!file.type.startsWith('image/')) return file
  try {
    const bitmap = await createImageBitmap(file)
    const escala = Math.min(1, maxLado / Math.max(bitmap.width, bitmap.height))
    if (escala === 1 && file.size < 1024 * 1024) return file

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', calidad))
    if (!blob || blob.size >= file.size) return file
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })
  } catch {
    return file
  }
}
