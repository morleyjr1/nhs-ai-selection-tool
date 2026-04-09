// ---------------------------------------------------------------------------
// Mismatch checker API route — uses Claude Haiku to semantically compare
// a justification text against the selected score for a given dimension.
//
// POST /api/lookup/mismatch
// Body: { dimensionId, dimensionName, side, score, scoreDescriptors, justification, guidingQuestions, context? }
// Returns: { mismatch: boolean, confidence: "low"|"medium"|"high", explanation: string, suggestedFlagText: string }
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";

interface MismatchRequest {
  dimensionId: string;
  dimensionName: string;
  side: "complexity" | "readiness";
  score: 1 | 2 | 3;
  scoreDescriptors: { level: number; label: string; description: string }[];
  justification: string;
  guidingQuestions: string[];
  context?: string;
}

export interface MismatchResult {
  mismatch: boolean;
  confidence: "low" | "medium" | "high";
  explanation: string;
  suggestedFlagText: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 503 },
    );
  }

  let body: MismatchRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    dimensionId,
    dimensionName,
    side,
    score,
    scoreDescriptors,
    justification,
    guidingQuestions,
    context,
  } = body;

  if (!dimensionId || !justification || !score || !scoreDescriptors) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Build the system prompt
  const sideLabel = side === "complexity" ? "complexity" : "organisational readiness";
  const scoreDirection =
    side === "complexity"
      ? "Higher scores mean greater complexity (harder to deploy safely)."
      : "Higher scores mean greater readiness (better prepared to deploy).";

  const descriptorText = scoreDescriptors
    .map((d) => `  Score ${d.level} (${d.label}): ${d.description}`)
    .join("\n");

  const questionsText = guidingQuestions.length > 0
    ? `\nGuiding questions for this dimension:\n${guidingQuestions.map((q) => `  - ${q}`).join("\n")}`
    : "";

  const contextText = context
    ? `\nAdditional context provided by the assessor: ${context}`
    : "";

  const systemPrompt = `You are a consistency checker for an NHS AI tool assessment framework. Your job is to determine whether a written justification is consistent with the numerical score assigned to a specific dimension.

You are checking the "${dimensionName}" dimension (${dimensionId}), which measures ${sideLabel}. ${scoreDirection}

The scoring levels for this dimension are:
${descriptorText}
${questionsText}
${contextText}

The assessor has selected Score ${score} (${scoreDescriptors[score - 1]?.label}).

Analyse the justification text below and determine:
1. Whether the text describes characteristics that are consistent with Score ${score}, or whether it suggests a different score would be more appropriate.
2. If there is a mismatch, explain briefly what in the text suggests a different score.
3. If there is a mismatch, produce a ready-to-use flag message that could be shown to the assessor.

Respond ONLY with valid JSON in exactly this format (no markdown, no explanation outside the JSON):
{
  "mismatch": true/false,
  "confidence": "low"/"medium"/"high",
  "explanation": "Brief explanation of why there is or isn't a mismatch",
  "suggestedFlagText": "Ready-to-use flag text for the assessor, or empty string if no mismatch"
}

Be calibrated. Only flag genuine mismatches where the text clearly implies a different score level. Do not flag:
- Vague or short justifications (these are not mismatches, just incomplete)
- Cases where the text is ambiguous and could support the chosen score
- Minor wording issues

If the justification is too short or vague to assess, return mismatch: false with a low confidence.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `Justification text to check:\n\n"${justification}"`,
          },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Anthropic API returned ${response.status}` },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: "Empty response from API" },
        { status: 502 },
      );
    }

    // Parse the JSON response from Haiku
    let result: MismatchResult;
    try {
      result = JSON.parse(content);
    } catch {
      // If Haiku wraps it in markdown or adds text, try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse Haiku response:", content);
        return NextResponse.json(
          { error: "Could not parse API response" },
          { status: 502 },
        );
      }
    }

    return NextResponse.json(result);
  } catch (e) {
    console.error("Mismatch check error:", e);
    return NextResponse.json(
      { error: "Failed to check for mismatch" },
      { status: 500 },
    );
  }
}
