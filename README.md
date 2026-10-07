# Path of Xuanzang · 玄奘之路

A full-screen, camera-controlled event experience built with Next.js. The game plays five cinematic question clips, asks the room to choose between two answers by moving left or right, reveals the historical figure behind Tang Sanzang, and opens onto Xuanzang's journey map.

## Run locally

```bash
bun install
bun dev
```

Open `http://localhost:3000` and allow camera access. Raise both hands and hold to begin. During each question, participants move to the left or right side of the camera frame; the game counts the group, chooses the majority side, and locks the result after the countdown. The webcam image is never displayed or uploaded—pose processing happens locally in the browser.

Keyboard controls remain available as an operator fallback: left/right arrows select, Space locks, Enter advances, `R` replays video, `O` opens the operator HUD, and Escape resets.

## Operator controls

| Key | Action |
| --- | --- |
| `←` | Select the left answer |
| `→` | Select the right answer |
| `Space` | Lock the current choice |
| `Enter` | Start, skip, or continue |
| `R` | Replay the current video |
| `O` | Toggle the hidden operator HUD |
| `Escape` | Open reset confirmation |

Choice zones also respond to clicks for rehearsals and testing.

Locked answers are saved globally in the Supabase `path_of_xuanzang_station1_votes` table as aggregate left/right counts and the selected option. Open the operator HUD with `O` and choose **Export Votes CSV** to download the records from Supabase. The camera does not identify individual participants.

Set the server-only `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` variables in `.env.local` and in the deployment environment. The `/api/votes` route limits access to vote records so the Supabase key is not sent to browsers. The migration in `supabase/migrations/` creates the vote table and its row-level security policies.

## Content

The five questions, answer choices, and answer explanations live in `data/station1.ts`. Each round plays its matching clip before the question.

The local video files are expected at:

```text
public/videos/Station1(pt1).mp4
public/videos/Station1(pt2).mp4
public/videos/Station1(pt3).mp4
public/videos/Station1(pt4).mp4
public/videos/Station1(pt5).mp4
```

## Deploy to Vercel

Import this repository in Vercel and keep the detected Next.js defaults. No environment variables or external services are required. The experience remains client-side and all essential media is served from the repository.

Before an event, test the production URL on the actual display computer, grant camera access, confirm the full body area is visible, and use the browser's kiosk/fullscreen mode. Vercel provides the HTTPS context required for browser camera access.
