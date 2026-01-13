import Anthropic from '@anthropic-ai/sdk'
import type { Employee, StyleProfile, QuantitativeProfile, QualitativeProfile } from '../types'
import { saveStyleProfile } from './firestoreService'

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const STYLE_ANALYSIS_SYSTEM_PROMPT = `Du bist ein hochspezialisierter Textanalyst nach dem PPP-System (Prime, Prompt, Polish) mit Mustererkennung.

# AUFGABE
Analysiere die folgenden Mustertexte und erstelle ein detailliertes Stilprofil.

# MUSTERERKENNUNGSSYSTEM

## 1. QUANTITATIVE ANALYSE

**Basis-Metriken:**
- Anzahl der Wörter pro Beitrag
- Anzahl der Wörter pro Satz
- Anzahl der Sätze pro Absatz
- Anzahl der Zeilen pro Absatz
- Anzahl der Emojis pro Beitrag
- Verhältnis von Emojis zu Text
- Am häufigsten verwendete Emojis (Top 5)
- Am häufigsten verwendete Wörter (Top 10, ohne "und", "der", "die", "das", "ist", "in", "zu")
- Anzahl der Zeilenumbrüche pro Beitrag
- Anzahl der Absatzumbrüche pro Beitrag

**Satzlängen-Verteilung (in Prozent):**
- Sätze mit weniger als 3 Wörtern
- Sätze mit 4–8 Wörtern
- Sätze mit 9–15 Wörtern
- Sätze mit 16–25 Wörtern
- Sätze mit 26+ Wörtern

## 2. QUALITATIVE ANALYSE
- Tonalität im Detail (z.B. motivierend, sachlich, informell, provokativ)
- Rhythmus, Satzbau und Struktur der Absätze
- Art der Sprache/Botschaftsvermittlung (direkt, rhetorisch, erklärend, storytelling)
- Überzeugungen/Beliefs, die vermittelt werden

# OUTPUT FORMAT
Antworte AUSSCHLIESSLICH im folgenden JSON-Format ohne zusätzlichen Text:

{
  "quantitative": {
    "avgWordsPerPost": number,
    "avgWordsPerSentence": number,
    "avgSentencesPerParagraph": number,
    "avgLinesPerParagraph": number,
    "avgEmojisPerPost": number,
    "emojiToTextRatio": number,
    "topEmojis": ["emoji1", "emoji2"],
    "topWords": ["wort1", "wort2"],
    "avgLineBreaksPerPost": number,
    "avgParagraphBreaksPerPost": number,
    "sentenceLengthDistribution": {
      "under3Words": number,
      "words4to8": number,
      "words9to15": number,
      "words16to25": number,
      "over25Words": number
    }
  },
  "qualitative": {
    "tonality": "string",
    "rhythm": "string",
    "communicationStyle": "string",
    "beliefs": "string"
  }
}`

interface StyleAnalysisResult {
  quantitative: QuantitativeProfile
  qualitative: QualitativeProfile
}

export async function analyzeStyle(
  sampleTexts: string,
  employeeId: string
): Promise<StyleProfile> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `# MUSTERTEXTE:\n${sampleTexts}`,
      },
    ],
    system: STYLE_ANALYSIS_SYSTEM_PROMPT,
  })

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  // Parse JSON response
  const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Could not parse JSON from Claude response')
  }

  const analysisResult: StyleAnalysisResult = JSON.parse(jsonMatch[0])

  // Save to Firestore and return
  const profileId = await saveStyleProfile(
    employeeId,
    analysisResult.quantitative,
    analysisResult.qualitative
  )

  return {
    id: profileId,
    employeeId,
    analyzedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as never,
    quantitative: analysisResult.quantitative,
    qualitative: analysisResult.qualitative,
  }
}

function buildGenerationSystemPrompt(employee: Employee, styleProfile: StyleProfile): string {
  const { quantitative, qualitative } = styleProfile

  // Defensive defaults for potentially undefined values from Firestore
  const topEmojis = quantitative?.topEmojis || []
  const topWords = quantitative?.topWords || []
  const distribution = quantitative?.sentenceLengthDistribution || {
    under3Words: 0,
    words4to8: 0,
    words9to15: 0,
    words16to25: 0,
    over25Words: 0,
  }

  return `Du bist ein hochspezialisierter LinkedIn-Ghostwriter für ${employee.name || 'den Mitarbeiter'}.
Du imitierst den Schreibstil präzise basierend auf dem analysierten PPP-Stilprofil.

# ALLGEMEINE TONALITÄT
${employee.toneDescription || 'Professionell und authentisch'}

# ANALYSIERTES STILPROFIL

## Quantitative Vorgaben (STRIKT EINHALTEN)
- Ziel-Wortanzahl: ${quantitative?.avgWordsPerPost ?? 150} Wörter (±10%)
- Wörter pro Satz: ~${quantitative?.avgWordsPerSentence ?? 12}
- Sätze pro Absatz: ~${quantitative?.avgSentencesPerParagraph ?? 3}
- Emojis pro Post: ~${quantitative?.avgEmojisPerPost ?? 2}
- Zeilenumbrüche: ~${quantitative?.avgLineBreaksPerPost ?? 5}
- Absatzumbrüche: ~${quantitative?.avgParagraphBreaksPerPost ?? 3}

## Satzlängen-Verteilung (WICHTIG - EXAKT EINHALTEN)
- ${distribution.under3Words ?? 0}% sehr kurze Sätze (1-3 Wörter)
- ${distribution.words4to8 ?? 0}% kurze Sätze (4-8 Wörter)
- ${distribution.words9to15 ?? 0}% mittlere Sätze (9-15 Wörter)
- ${distribution.words16to25 ?? 0}% längere Sätze (16-25 Wörter)
- ${distribution.over25Words ?? 0}% lange Sätze (26+ Wörter)

## Bevorzugte Elemente (VERWENDEN)
- Diese Emojis nutzen: ${topEmojis.length > 0 ? topEmojis.join(', ') : '(keine spezifischen)'}
- Diese Wörter/Phrasen einbauen: ${topWords.length > 0 ? topWords.join(', ') : '(keine spezifischen)'}

## Qualitative Vorgaben (STIL IMITIEREN)
- Tonalität: ${qualitative?.tonality || 'Professionell'}
- Rhythmus & Struktur: ${qualitative?.rhythm || 'Ausgewogen'}
- Kommunikationsstil: ${qualitative?.communicationStyle || 'Direkt'}
- Beliefs/Werte transportieren: ${qualitative?.beliefs || 'Authentizität'}

# REGELN
1. Halte dich EXAKT an die Satzlängen-Verteilung
2. Verwende die typischen Wörter und Emojis natürlich im Text
3. Imitiere den Rhythmus und die Struktur präzise
4. Schreibe IMMER in Schweizer Rechtschreibung (ss statt ß, z.B. "grossartig" nicht "großartig")
5. Der Post muss authentisch nach ${employee.name || 'dem Mitarbeiter'} klingen
6. Kein Post sollte gleich beginnen wie ein anderer

# AUFGABE
Erstelle aus folgendem Inhalt einen LinkedIn-Post im Stil von ${employee.name || 'dem Mitarbeiter'}:`
}

export async function generatePost(
  inputContent: string,
  employee: Employee,
  styleProfile: StyleProfile
): Promise<string> {
  const systemPrompt = buildGenerationSystemPrompt(employee, styleProfile)

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: inputContent,
      },
    ],
    system: systemPrompt,
  })

  // Extract text content from response
  const textContent = message.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response')
  }

  return textContent.text
}

// Utility function to calculate post statistics
export function calculatePostStats(content: string): {
  wordCount: number
  emojiCount: number
  paragraphCount: number
  sentenceCount: number
} {
  // Defensive null check - content can be undefined during initial render
  if (!content || typeof content !== 'string') {
    return {
      wordCount: 0,
      emojiCount: 0,
      paragraphCount: 0,
      sentenceCount: 0,
    }
  }

  const words = content.split(/\s+/).filter((w) => w.length > 0)
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
  const emojis = content.match(emojiRegex) || []
  const paragraphs = content.split(/\n\n+/).filter((p) => p.trim().length > 0)
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  return {
    wordCount: words.length,
    emojiCount: emojis.length,
    paragraphCount: paragraphs.length,
    sentenceCount: sentences.length,
  }
}
