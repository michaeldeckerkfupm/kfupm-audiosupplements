# Listening review checkpoint

Updated 28 October 2026. This is an ongoing review, not a claim that the entire bank has passed.

## Scope and sources

81 tests, 904 questions. Source: Google Drive `010 Listening Site Folder`, ID `1hxyfNfLodBLenWrIZzkDMQmSGF68Sj8H`. Repository branch: main. Preserve the no-timer design, randomized choices, saved answers/flags, and current-exam format disclaimer.

New recordings restored: Long / Teacher / Test 7 (College, model-maker), Drive ID `1fen2xYACIi10Vx_JPjb_La-MmJjYCFio`; Test 8 (Writer), ID `10GjyPtSrR_YGoqmIyOhbjhY1bUEwhUoS`. Uploaded as mono 64 kbps MP3s with unchanged content and timing.

## Completed source review

All Short Set 1 tests 1–20 and Short Set 2 tests 1–15; Long Practice 1–4 tests 1–4; Long Teacher tests 1–5; Full exams 8, 15, 16. Total: 47 tests / 420 questions. Review uses time-stamped local transcriptions of the actual recordings, with focused retranscription of uncertain excerpts. Illustrations for all 24 image-based questions have been visually inspected. All referenced audio and image paths have been checked locally.

## Remaining source review

Long Teacher tests 6–10; all Long Student tests 1–11; Full exams 1–7, 9–14, 17–21. Total: 34 tests / 484 questions. The recording transcriptions are being generated locally; their existence alone does not mean the questions have been reviewed. Final browser/data checks and production deployment verification remain.

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

Question-revised tests use a revision suffix in their saved-state key so previous responses are not scored against altered options. Unchanged tests preserve existing saved progress.

## Bank limitations to retain in final handover

Some full exams reuse entire sections: 9/12, 10/13, 11/14, and the Travel-Lite section in 16/21. Original exact-duplicate check found 41 repeated question occurrences across the bank. These are useful practice, but not independent parallel forms; the site now warns about reuse. Making independent forms needs new source material. Existing recordings also follow older paper-based exam formats. Do not claim equivalence to the current full exam.

## First committed checkpoint

`bc6c2713183d38d92af7f590bb7f297ed6e6bc5a`: audio restoration, seeking fix, initial timing and key corrections. Later commits continue this review.
