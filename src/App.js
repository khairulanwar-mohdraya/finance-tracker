import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import "./App.css";

// Set the worker source globally
GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.min.js");

function App() {
  const [entries, setEntries] = useState([]);

  // Add new state for form inputs
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'Expense'
  });

  // Add new handler for form submission
  const handleManualAdd = (e) => {
    e.preventDefault();
    
    // Format the date to match the PDF format (DD/MM/YY)
    const formattedDate = new Date(newTransaction.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

    const transaction = {
      ...newTransaction,
      date: formattedDate,  // Use the formatted date
      amount: parseFloat(newTransaction.amount)
    };

    // Convert all dates to timestamps for comparison
    const newDate = new Date(newTransaction.date).getTime();
    
    // Create new array with the new transaction inserted in the correct position
    const updatedEntries = [...entries];
    const insertIndex = updatedEntries.findIndex(entry => {
      // Split the date parts and rearrange to YYYY-MM-DD format for proper comparison
      const [day, month, year] = entry.date.split('/');
      const entryDate = new Date(`20${year}-${month}-${day}`).getTime();
      return newDate < entryDate;
    });

    if (insertIndex === -1) {
      // If no earlier date found, append to the end
      updatedEntries.push(transaction);
    } else {
      // Insert at the correct position
      updatedEntries.splice(insertIndex, 0, transaction);
    }

    setEntries(updatedEntries);
    
    // Reset form
    setNewTransaction({
      date: '',
      description: '',
      amount: '',
      type: 'Expense'
    });
  };

  // Add new handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileReader = new FileReader();
      fileReader.onload = async () => {
        const typedArray = new Uint8Array(fileReader.result);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;

        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        processPDFData(fullText);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  const splitByDates = (text) => {
    // Regex to identify date patterns (dd/mm/yy)
    const dateRegex = /\d{2}\/\d{2}\/\d{2}/g;
  
    // Split the text at each date while keeping the date in the split parts
    return text.split(dateRegex).reduce((result, part, index) => {
      if (index === 0) return result; // Skip the initial part before the first date
      const dateMatch = text.match(dateRegex)[index - 1];
      result.push(`${dateMatch} ${part.trim()}`);
      return result;
    }, []);
  };
  

  const processPDFData = (pdfText) => {
    console.log("Processing PDF text:", pdfText);
  
    // Step 1: Split concatenated transactions by dates
    const splitLines = splitByDates(pdfText);
    console.log("Split lines by dates:", splitLines);
  
    // Step 2: Apply regex to extract transactions
    const transactions = [];
    splitLines.forEach((line) => {
      const match = line.match(
        /(\d{2}\/\d{2}\/\d{2})\s+([A-Za-z0-9\s\-@*.,'/]+)\s+([\d.,]+[-]?)\s+([\d.,]+)/
      );
      
      if (match) {
        console.log("Matched transaction:", match);
        const [_, date, description, amount] = match;
  
        const type = amount.includes("-") ? "Expense" : "Income";
  
        transactions.push({
          date,
          description: description.trim(),
          amount: parseFloat(amount.replace(",", "").replace("-", "")),
          type,
        });
      } else {
        console.log("Unmatched line:", line);
      }
    });
  
    console.log("Extracted transactions:", transactions);
  
    // Step 3: Update the state with extracted transactions
    setEntries(transactions);
  };
  

  return (
    <div className="App">
      <header>
        <h1>Simple Finance Tracker</h1>
      </header>
      <div className="manual-entry-section">
        <h3>Add Transaction Manually</h3>
        <form onSubmit={handleManualAdd}>
          <input
            type="date"
            name="date"
            value={newTransaction.date}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newTransaction.description}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            step="0.01"
            value={newTransaction.amount}
            onChange={handleInputChange}
            required
          />
          <select
            name="type"
            value={newTransaction.type}
            onChange={handleInputChange}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
          <button type="submit">Add Transaction</button>
        </form>
      </div>

      <div className="upload-section">
        <h3>Upload Bank Statement (PDF)</h3>
        <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      </div>

      <div className="entries">
        <h2>Entries</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.type}</td>
                <td>{entry.amount}</td>
                <td>{entry.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
