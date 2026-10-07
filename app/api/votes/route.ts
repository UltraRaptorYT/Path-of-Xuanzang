import { station1Rounds, type Side } from "@/data/station1";
import { getSupabaseClient } from "@/lib/supabase";

const TABLE = "path_of_xuanzang_station1_votes";
const PAGE_SIZE = 1000;
const VOTE_COLUMNS = "session_id, recorded_at, round_id, round_number, question_zh, question_en, left_count, right_count, selected_side, selected_choice_zh, selected_choice_en, correct";
const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();
    const requestedRoundId = new URL(request.url).searchParams.get("roundId");

    if (requestedRoundId) {
      const round = station1Rounds.find((item) => item.id === requestedRoundId);
      if (!round) {
        return Response.json({ error: "Unknown round." }, { status: 400, headers: NO_STORE });
      }

      let leftCount = 0;
      let rightCount = 0;
      for (let from = 0; ; from += PAGE_SIZE) {
        const { data, error } = await client
          .from(TABLE)
          .select("left_count, right_count, selected_side")
          .eq("round_id", round.id)
          .order("recorded_at", { ascending: true })
          .order("id", { ascending: true })
          .range(from, from + PAGE_SIZE - 1);

        if (error) throw error;

        for (const row of data) {
          const peopleCount = row.left_count + row.right_count;
          if (peopleCount > 0) {
            leftCount += row.left_count;
            rightCount += row.right_count;
          } else if (row.selected_side === "left") {
            leftCount += 1;
          } else {
            rightCount += 1;
          }
        }

        if (data.length < PAGE_SIZE) {
          return Response.json(
            { leftCount, rightCount, totalCount: leftCount + rightCount },
            { headers: NO_STORE },
          );
        }
      }
    }

    const records = [];

    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await client
        .from(TABLE)
        .select(VOTE_COLUMNS)
        .order("recorded_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) throw error;

      records.push(...data.map((row) => ({
        sessionId: row.session_id,
        recordedAt: row.recorded_at,
        roundId: row.round_id,
        roundNumber: row.round_number,
        questionZh: row.question_zh,
        questionEn: row.question_en,
        leftCount: row.left_count,
        rightCount: row.right_count,
        selectedSide: row.selected_side as Side,
        selectedChoiceZh: row.selected_choice_zh,
        selectedChoiceEn: row.selected_choice_en,
        correct: row.correct,
      })));

      if (data.length < PAGE_SIZE) {
        return Response.json(records, { headers: NO_STORE });
      }
    }
  } catch (error) {
    console.error("Could not load Path of Xuanzang votes", error);
    return Response.json({ error: "Could not load the global vote records." }, { status: 503, headers: NO_STORE });
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Invalid vote record." }, { status: 400, headers: NO_STORE });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid vote record." }, { status: 400, headers: NO_STORE });
  }

  const round = station1Rounds.find((item) => item.id === body.roundId);
  const side = body.selectedSide;
  if (
    !round ||
    body.roundNumber !== station1Rounds.indexOf(round) + 1 ||
    typeof body.sessionId !== "string" || body.sessionId.length < 1 || body.sessionId.length > 80 ||
    (side !== "left" && side !== "right") ||
    !Number.isInteger(body.leftCount) || Number(body.leftCount) < 0 || Number(body.leftCount) > 6 ||
    !Number.isInteger(body.rightCount) || Number(body.rightCount) < 0 || Number(body.rightCount) > 6
  ) {
    return Response.json({ error: "Vote fields are invalid." }, { status: 400, headers: NO_STORE });
  }

  const selectedSide = side as Side;
  const selectedChoice = round.choices[selectedSide];
  let insertionError: { code: string; message: string } | null;
  try {
    const result = await getSupabaseClient().from(TABLE).insert({
      session_id: body.sessionId,
      round_id: round.id,
      round_number: station1Rounds.indexOf(round) + 1,
      question_zh: round.questionZh,
      question_en: round.questionEn,
      left_count: Number(body.leftCount),
      right_count: Number(body.rightCount),
      selected_side: selectedSide,
      selected_choice_zh: selectedChoice.zh,
      selected_choice_en: selectedChoice.en,
      correct: round.correctSide ? round.correctSide === selectedSide : null,
    });
    insertionError = result.error;
  } catch (error) {
    console.error("Could not save Path of Xuanzang vote", error);
    return Response.json({ error: "Could not save the vote to the global database." }, { status: 503, headers: NO_STORE });
  }

  if (insertionError) {
    if (insertionError.code === "23505") {
      return Response.json({ error: "This round was already recorded for the current session." }, { status: 409, headers: NO_STORE });
    }
    console.error("Could not save Path of Xuanzang vote", insertionError);
    return Response.json({ error: "Could not save the vote to the global database." }, { status: 503, headers: NO_STORE });
  }

  return Response.json({ saved: true }, { status: 201, headers: NO_STORE });
}
