import { Quiz, QuizSession } from "@/src/types/quiz";

// Separated logic for easier testing and verification
export const generateCSVContent = (quiz: Quiz, session: QuizSession): string => {
  const locale = session.locale;

  // CSV Header
  // Changed: Removed "email" from header column
  const rows = [["order", "title", "type", "answer"]];

  // Map answers to rows
  session.answers.forEach((ans, index) => {
    const question = quiz.questions.find((q) => q.id === ans.questionId);
    if (!question) return;

    const title = question.text[locale];
    const type = question.type;

    let humanAnswer = "";

    // Map answer IDs back to readable labels
    if (question.options) {
      const selectedIds = Array.isArray(ans.value) ? ans.value : [ans.value];
      const selectedLabels = selectedIds.map((id) => {
        const opt = question.options?.find((o) => o.id === id);
        // If option found, return translated text. If not (maybe simple input?), return id.
        return opt ? opt.text[locale] : id;
      });
      humanAnswer = selectedLabels.join(", ");
    } else {
      // If no options (e.g. text input), simple value
      humanAnswer = Array.isArray(ans.value) ? ans.value.join(", ") : ans.value;
    }

    rows.push([
      (index + 1).toString(),
      `"${title.replace(/"/g, '""')}"`, // Escape quotes
      type,
      `"${humanAnswer.replace(/"/g, '""')}"`,
    ]);
  });

  // Add Email as a separate row if it exists
  if (session.email) {
    rows.push([
      (rows.length).toString(), // Order (next one)
      "Email",                  // Title
      "email",                  // Type
      session.email,            // Answer
    ]);
  }

  // Convert to CSV string, adding BOM for Excel compatibility if needed (optional, keeping simple for now)
  const csvContent =
    "data:text/csv;charset=utf-8," +
    rows.map((e) => e.join(",")).join("\n");
  
  return csvContent;
};

export const downloadCSV = (quiz: Quiz, session: QuizSession) => {
  const csvContent = generateCSVContent(quiz, session);

  // Trigger download
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `holywater-quiz-${session.sessionId || "results"}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
