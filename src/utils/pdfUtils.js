import { determineCategory } from './categoryUtils';

export const splitByDates = (text) => {
  const dateRegex = /\d{2}\/\d{2}\/\d{2}/g;
  return text.split(dateRegex).reduce((result, part, index) => {
    if (index === 0) return result;
    const dateMatch = text.match(dateRegex)[index - 1];
    result.push(`${dateMatch} ${part.trim()}`);
    return result;
  }, []);
};

export const processPDFData = (pdfText) => {
  console.log("Processing PDF text:", pdfText);

  const beginningBalanceMatch = pdfText.match(/BEGINNING BALANCE\s+([\d,]+\.\d{2})/);
  const beginningBalance = beginningBalanceMatch 
    ? parseFloat(beginningBalanceMatch[1].replace(",", ""))
    : null;

  const splitLines = splitByDates(pdfText);
  const transactions = [];

  if (beginningBalance) {
    const firstDateMatch = pdfText.match(/(\d{2}\/\d{2}\/\d{2})/);
    if (firstDateMatch) {
      transactions.push({
        date: firstDateMatch[1],
        description: "Beginning Balance",
        amount: beginningBalance,
        type: "Income",
        balance: beginningBalance,
        details: "",
        category: "BALANCE"
      });
    }
  }

  splitLines.forEach((line) => {
    const match = line.match(
      /(\d{2}\/\d{2}\/\d{2})\s+([^0-9]+?)\s+([\d.,]+[-+])\s+([\d,]+\.\d{2})(?:\s+(.*?))?(?=\s+ENDING BALANCE|\s+\d{2}\/\d{2}\/\d{2}|\s+Maybank|$)/
    );
    
    if (match) {
      console.log("Matched transaction:", match);
      const [_, date, description, transactionAmount, balance, details = ""] = match;
      
      const amount = parseFloat(transactionAmount.replace(",", "").replace("-", "").replace("+", ""));
      const currentBalance = parseFloat(balance.replace(",", ""));
      
      const type = transactionAmount.includes("-") ? "Expense" : "Income";

      const category = determineCategory(details, description);

      transactions.push({
        date,
        description: description.trim(),
        amount,
        type,
        balance: currentBalance,
        details: details.trim(),
        category
      });
    } else {
      console.log("Unmatched line:", line);
    }
  });

  const endingBalanceMatch = pdfText.match(/ENDING BALANCE\s*:\s*([\d,]+\.\d{2})/);
  if (endingBalanceMatch) {
    const endingBalance = parseFloat(endingBalanceMatch[1].replace(",", ""));
    transactions.push({
      date: "",
      description: "ENDING BALANCE",
      amount: endingBalance,
      type: "Income",
      balance: endingBalance,
      details: "",
      category: "BALANCE"
    });
  }

  return transactions;
}; 