# Listening review and handover

Completed 28 October 2026. Source-content and item-design review is complete; this is not an empirical validation of test difficulty or form equivalence.

## Scope and sources

81 tests, 904 questions. Source: Google Drive `010 Listening Site Folder`, ID `1hxyfNfLodBLenWrIZzkDMQmSGF68Sj8H`. Repository branch: main. Preserve the no-timer design, randomized choices, saved answers/flags, and current-exam format disclaimer.

New recordings restored: Long / Teacher / Test 7 (College, model-maker), Drive ID `1fen2xYACIi10Vx_JPjb_La-MmJjYCFio`; Test 8 (Writer), ID `10GjyPtSrR_YGoqmIyOhbjhY1bUEwhUoS`. Uploaded as mono 64 kbps MP3s with unchanged content and timing.

## Completed source review

All 81 tests / 904 questions: Short Set 1 (1–20), Short Set 2 (1–15), Long Practice 1–4, Teacher (1–10), Student (1–11), and Full exams (1–21). Review used time-stamped local transcriptions of all actual recordings, with focused retranscription of uncertain or omitted excerpts. All 24 image-based questions were visually inspected, including transparent artwork composited on white. All referenced audio and image paths were checked locally.

77 questions in 44 tests received substantive or minor wording/formatting corrections. Five incorrect keys were corrected and three missing keys filled. Audio is now linked for every test. Changes preserve question counts and the original answer-option index wherever possible. Full Exam 21 Q6 had an audio/question mismatch: its clip discusses healthcare improvements since 1900, not the absent predictions about illness. The replacement tests the stated historical life expectancy in the clip.

## Verification

Browser checks passed for rendering all 81 tests and scoring all 904 questions with randomized options. Verified restored Teacher 7/8 recordings, actual playback, forward and backward seeking, saved-answer/flag persistence, audio-load failure feedback, logo/favicon loading, and 390px mobile layout. No JavaScript errors. Playback was tested against a local HTTP server that deliberately ignores byte-range requests. JavaScript syntax and all answer indices/asset paths passed validation.

GitHub main contains the work. Production hosting was not independently verified: automatic approval review rejected the optional Cloudflare account metadata check because separate-account access was not authorized. No Cloudflare account changes were made.

## Important verified corrections

Full Exam 8 Q4: fitness centre is inside the hotel, on the top floor, open 24 hours. Replaced incorrect key with an unambiguous ground-floor distractor. Q15: snow began by lunchtime, not after lunch. Q24: exams are still in the future, and the speaker expects to pass. Q30: audio at 1184–1192s forecasts a high of ABOUT 15 degrees tomorrow, not AT LEAST 15. Reworded question and choices to test the forecast temperature precisely; key is About 15 degrees.

Full Exam 15 Q30: audio at 1741–1767s says games cover finding food, protecting habitat and surviving threats. It does not mention extinction. Key: why dinosaurs became extinct. Q7/Q9 now clearly refer to Steve, whose phone battery died, rather than the stranded driver.

Full Exam 16 Q30: audio at 1088s and 1230s says entertainment is offered nearly every night. Key: almost every night. Replaced the overlapping every-tour alternative. Applied the same wording to repeated item Full Exam 21 Q18. Q7 alternatives now distinguish more than 160 mills from exactly 160.

Short Set 2 Test 5 Q6 and Test 8 Q8: 'You might have told me...' expresses annoyance at not being told, not uncertainty about a past possibility. Revised alternatives accordingly. Test 13 Q5: 'I suppose it is a bit chilly' supports mildly cold, not fully agreeing that it is freezing. Replaced overlapping agrees/strongly agrees choices.

Short Set 1 Test 6 Q1: speakers wait to see actual weather, not another forecast. Q2 had a malformed stem and now clearly asks about swimming. Test 10 Q4: both agree the marks are unfair; disagreement concerns nationality as the reason. Test 12 Q3: use distinct elapsed times. Test 14 Q1: asks what Mum says about the report, avoiding ambiguous attitudes. Test 15 Q1: Dad requires homework before going out; additional revision was not required in the spoken instruction. Test 16 Q4: removed gender cues from choices.

Short Set 2 Test 2 Q5 and Test 8 Q6: removed overlapping age ranges. Test 3 Q5: asks the reason for declining the car. Test 4 Q1: no evidence establishes the speaker is at work; now asks where smoking is allowed. Test 6 Q7: present perfect continuous alone does not prove the room is unfinished; asks the stated duration instead.

Long Practice 1 Q4: 'at least three' does not mean 'more than three'; now asks the minimum number of bedrooms. Teacher 2 Q6: asks what use is not mentioned, rather than claiming an unmentioned use is forbidden. Teacher 3 Q3: options are percentages, so the stem now asks for a percentage. Corrected the corrupted business-room option in Full Exam 19 Q13 and minor wording/spacing/currency errors elsewhere.

## Player and scoring

Audio is downloaded to a browser Blob URL before playback, so native seeking does not depend on hosting byte-range support. Browser test confirmed forward seeking to 150s and backward to 20s on Short Set 2 Test 1 with a finite 392.136s duration and no media error. Downloads abort on test changes and previous Blob URLs are revoked. Updated Set 2 instructions to acknowledge the built-in 60-second reading period. Added clarification about paper-answer-sheet instructions in legacy recordings.

Question-revised tests use a content-hash revision suffix in their saved-state key so previous responses are not scored against altered options. Unchanged tests preserve existing saved progress.

## Bank limitations to retain in final handover

Some full exams reuse entire sections: 9/12, 10/13, 11/14, and the Travel-Lite section in 16/21. Original exact-duplicate check found 41 repeated question occurrences across the bank. These are useful practice, but not independent parallel forms; the site now warns about reuse. Making independent forms needs new source material. Existing recordings also follow older paper-based exam formats. Do not claim equivalence to the current full exam.

## First committed checkpoint

`bc6c2713183d38d92af7f590bb7f297ed6e6bc5a`: audio restoration, seeking fix, initial timing and key corrections. Later commits continue this review.

## Branding and instruction cleanup

Added the English KFUPM wordmark and tower favicon from the official university homepage assets. Reversed the wordmark into a white, transparent treatment that fits the dark green header. Removed the redundant KFUPM from the page and tab title. Verified desktop and 390px mobile layouts without overflow. Removed the ready/seeking message and headphones/read-ahead boilerplate. Retained: “Some recordings refer to paper answer sheets. Answer on this page and click ‘Submit Answers’.” Button capitalization is Submit Answers throughout.

Logo source: https://www.kfupm.edu.sa/images/default-source/default-album/kfupm_logo_en.svg?sfvrsn=f12b570c_0

Tower favicon source: https://www.kfupm.edu.sa/ResourcePackages/Main/assets/dist/images/Favicon.svg

Further long-test corrections: Teacher 6 now distinguishes the proposed recycling centre from underground shops, frames the Russian city as hypothetical, and asks about the stated out-of-town projects. Teacher 7 asks for a percentage and uses detective precisely. Teacher 8 Q1 asks what is not stated, because more than 20 million does not logically exclude at least 26 million; Q5 identifies the new Bond novel. Student 5 corrects future closure tense; Student 8 removes an overlapping brain-activity alternative.

## Additional full-exam corrections

Full 1 Q10: the family left London in 1952 (audio around 462s), then reached Manchester in 1956. Corrected the key; also corrected Tanya Perry’s name. Full 3 Q13: the actual discounted price is £8 (around 543s), not the £10 normal price. Q3 now explicitly distinguishes running costs. Full 4 Q9 clarifies telephone booking through the ticket office. Full 5 Q1: the retired speaker is a student, not a teacher; the supported option is that he had left school by age 16. Full 7 Q13: a historic train trip without station stops indicates tourists rather than commuters. Full 11/14 Q10 now uses the stated year 1975 instead of the ageing “about 45 years ago.” Their Q16 asks what Tina claims, rather than treating her self-description as an established fact. Full 18 Q4 corrects a malformed alternative. Full 20 Q4 specifies evening hours, and Q15 removes an unsupported frequency claim about veterinary training. Full 21 Q3 distinguishes the path’s current condition from its former safety.

## Revised item index

| Section | Series | Test | Questions revised |
| --- | --- | --- | --- |
| short | Set 1 | 6 | 1, 2 |
| short | Set 1 | 10 | 2, 4 |
| short | Set 1 | 12 | 3 |
| short | Set 1 | 14 | 1 |
| short | Set 1 | 15 | 1 |
| short | Set 1 | 16 | 4 |
| short | Set 2 | 1 | 8 |
| short | Set 2 | 2 | 5 |
| short | Set 2 | 3 | 5 |
| short | Set 2 | 4 | 1 |
| short | Set 2 | 5 | 5, 6, 7 |
| short | Set 2 | 6 | 7 |
| short | Set 2 | 7 | 3 |
| short | Set 2 | 8 | 6, 7, 8 |
| short | Set 2 | 9 | 6 |
| short | Set 2 | 11 | 6 |
| short | Set 2 | 13 | 5, 7 |
| short | Set 2 | 14 | 5, 7 |
| long | Practice 1–4 | 1 | 4 |
| long | Teacher | 2 | 6 |
| long | Teacher | 3 | 3 |
| long | Teacher | 6 | 5, 6, 10 |
| long | Teacher | 7 | 3, 4 |
| long | Teacher | 8 | 1, 5 |
| long | Teacher | 9 | 9 |
| long | Student | 1 | 5 |
| long | Student | 5 | 9 |
| long | Student | 8 | 10 |
| long | Student | 10 | 3, 8 |
| full | Full exams | 1 | 10, 12, 13 |
| full | Full exams | 3 | 3, 13 |
| full | Full exams | 4 | 9 |
| full | Full exams | 5 | 1, 10 |
| full | Full exams | 7 | 13, 16 |
| full | Full exams | 8 | 4, 13, 15, 24, 30 |
| full | Full exams | 11 | 10, 16 |
| full | Full exams | 13 | 8 |
| full | Full exams | 14 | 8, 10, 16 |
| full | Full exams | 15 | 7, 9, 30 |
| full | Full exams | 16 | 7, 30 |
| full | Full exams | 18 | 4 |
| full | Full exams | 19 | 4, 13, 14 |
| full | Full exams | 20 | 4, 15 |
| full | Full exams | 21 | 3, 6, 18 |
