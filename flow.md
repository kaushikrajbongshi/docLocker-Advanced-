User
  ↓
Dashboard
  ↓
/api/files/:id/summarize
  ↓
MongoDB
(find document)
  ↓
Cloudinary
(download PDF)
  ↓
pdf-parse
(extract text)
  ↓
OpenAI API
(generate summary)
  ↓
MongoDB
(save summary)
  ↓
Frontend
(show popup)