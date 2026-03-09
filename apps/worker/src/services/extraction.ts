import pdfParse from 'pdf-parse'

import type { JsonValue } from '@docuflow/shared'

import { recognizeTextFromImage } from './ocr.js'

interface ExtractionInput {
  filename: string
  mimeType: string
  sizeBytes: number
  buffer: Buffer
}

interface ExtractionResult {
  extractedText: string
  extractedData: JsonValue
}

function normalizeExtractedData(input: ExtractionInput, text: string): JsonValue {
  const totals = Array.from(text.matchAll(/\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g)).map((match) => match[0]).slice(0, 5)
  const dates = Array.from(text.matchAll(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g)).map((match) => match[0]).slice(0, 5)
  const invoiceNumbers = Array.from(text.matchAll(/\b(?:invoice|claim)[\s#:]*([A-Z0-9-]{3,})/gi)).map((match) => match[1]).slice(0, 5)
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

  return {
    source: {
      filename: input.filename,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    },
    summary: {
      characterCount: text.length,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      lineCount: lines.length,
    },
    preview: text.slice(0, 500),
    fields: {
      totals,
      dates,
      invoiceOrClaimReferences: invoiceNumbers,
    },
  }
}

export async function extractDocument(input: ExtractionInput): Promise<ExtractionResult> {
  if (input.mimeType === 'text/plain') {
    const extractedText = input.buffer.toString('utf8').trim()
    return {
      extractedText,
      extractedData: normalizeExtractedData(input, extractedText),
    }
  }

  if (input.mimeType === 'application/pdf') {
    const pdf = await pdfParse(input.buffer)
    const extractedText = pdf.text.trim()

    if (!extractedText) {
      throw new Error('PDF text extraction returned no text. OCR fallback for scanned PDFs needs a PDF rasterizer and is not wired in this local-only version.')
    }

    return {
      extractedText,
      extractedData: normalizeExtractedData(input, extractedText),
    }
  }

  if (input.mimeType === 'image/png' || input.mimeType === 'image/jpeg') {
    const extractedText = await recognizeTextFromImage(input.buffer)
    return {
      extractedText,
      extractedData: normalizeExtractedData(input, extractedText),
    }
  }

  throw new Error(`No extractor is configured for ${input.mimeType}.`)
}
