import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WrongAnswer {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wrongAnswers, subject } = await req.json() as { 
      wrongAnswers: WrongAnswer[]; 
      subject: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const questionsText = wrongAnswers.map((wa, i) => 
      `${i + 1}. Вопрос: "${wa.question}"
   Ответ ученика: "${wa.userAnswer}"
   Правильный ответ: "${wa.correctAnswer}"
   ${wa.explanation ? `Краткое пояснение: ${wa.explanation}` : ''}`
    ).join('\n\n');

    const systemPrompt = `Ты — опытный преподаватель по предмету "${subject}". 
Твоя задача — помочь ученику понять его ошибки в тесте.

Правила:
1. Объясняй понятно и доступно, как будто объясняешь другу
2. Используй примеры из реальной жизни
3. Дай практический совет как запомнить правильный ответ
4. Будь позитивным и мотивирующим
5. Отвечай на русском языке
6. Для каждой ошибки дай структурированное объяснение`;

    const userPrompt = `Ученик допустил следующие ошибки в тесте:

${questionsText}

Пожалуйста, объясни каждую ошибку подробно и помоги понять правильный ответ. Используй эмодзи для наглядности.`;

    console.log("Calling Lovable AI for error explanation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Слишком много запросов. Попробуйте позже." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Превышен лимит использования AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;

    if (!explanation) {
      throw new Error("No explanation received from AI");
    }

    console.log("AI explanation received successfully");

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in explain-errors function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
