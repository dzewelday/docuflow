import Tesseract from 'tesseract.js'

export async function recognizeTextFromImage(buffer: Buffer) {
  const result = await Tesseract.recognize(buffer, 'eng')
  return result.data.text.trim()
}
