# Reading conversion checkpoints

Source files are the user-supplied Word packets, referenced by filename in the
conversion scripts. They are not offered as teacher-key downloads on the site.

The local conversion sequence for the additional reading packets is:

```sh
python build_other_readings.py
cp other-reading-tests.json other-reading-tests-full.json
python correct_other_readings.py
python prepare_passage_documents.py
soffice -env:UserInstallation=file:///tmp/clean-passage-render-profile --headless --convert-to pdf --outdir /tmp/clean-passage-pdfs /tmp/clean-passage-docx/*.docx
python build_clean_passage_images.py
python export_reading_collections.py
```

The B1 content file already includes the corrections documented in
READING-AUDIT.md. It should not be replaced by an unaudited raw import.

Every original-page image is a passage-only render. The responsive text is an
alternative view of the same attempt; changing the view does not restart its
20-minute clock. Answers, flags, choice order and deadlines are saved locally.
The brand header links to index.html. Listening progress includes answers,
flags and the last saved playback position.

Final visual repair: run `python fix_driving_layout.py` after generating passage images. It uses page 30 of the original rendered student PDF, retains the original passage text and line positions, restores the three source diagrams, moves the overlapping second diagram caption clear of the body text, and places the third diagram below the passage. It writes the corrected B1 Reading 15 WebP. Its local PDF input must already exist in `/tmp/reading-pdfs/`.

Verification: `check-reading-collections.cjs` exercises all 620 other-reading answer keys, 64 collection images, disclaimer text, switching passage views without resetting the deadline, header styling, saved answers/flags after home navigation, and the mobile original-image default. `check-reading-practice.cjs` checks the 172 B1 keys, vocabulary, saved attempts and automatic expiry. All readings now open in original-image view on every device; browser text remains an optional switch.
