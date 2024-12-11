import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import "./App.css";

// You can replace this with your actual logo
const LOGO_URL = "https://via.placeholder.com/40";

function App() {
  const [entries, setEntries] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'Expense'
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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
    date: formattedDate,
    amount: parseFloat(newTransaction.amount)
  };

   // Create new array with the new transaction inserted in the correct position
   const updatedEntries = [...entries];

   // Helper function to convert date string to comparable timestamp
  const getTimestamp = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    // Ensure year is interpreted as 20XX
    const fullYear = year.length === 2 ? `20${year}` : year;
    return new Date(`${fullYear}-${month}-${day}`).getTime();
  };

  // Sort all entries including the new one
  const sortedEntries = [...updatedEntries, transaction].sort((a, b) => {
    return getTimestamp(a.date) - getTimestamp(b.date);
  });

  setEntries(sortedEntries);

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
  
    // First, try to extract beginning balance
    const beginningBalanceMatch = pdfText.match(/BEGINNING BALANCE\s+([\d,]+\.\d{2})/);
    const beginningBalance = beginningBalanceMatch 
      ? parseFloat(beginningBalanceMatch[1].replace(",", ""))
      : null;
  
    // Step 1: Split concatenated transactions by dates
    const splitLines = splitByDates(pdfText);
    console.log("Split lines by dates:", splitLines);
  
    // Step 2: Apply regex to extract transactions
    const transactions = [];
  
    // Add beginning balance as first transaction if found
    if (beginningBalance) {
      const firstDateMatch = pdfText.match(/(\d{2}\/\d{2}\/\d{2})/);
      if (firstDateMatch) {
        transactions.push({
          date: firstDateMatch[1],
          description: "Beginning Balance",
          amount: beginningBalance,
          type: "Income",
          details: ""
        });
      }
    }
  
    splitLines.forEach((line) => {
      // Updated regex to handle transactions without details
      const match = line.match(
        /(\d{2}\/\d{2}\/\d{2})\s+([^0-9]+?)\s+([\d.,]+[-+])\s+([\d,]+\.\d{2})(?:\s+(.*?))?(?=\s+\d{2}\/\d{2}\/\d{2}|\s+Maybank|$)/
      );
      
      if (match) {
        console.log("Matched transaction:", match);
        const [_, date, description, transactionAmount, balance, details = ""] = match;
        
        const amount = parseFloat(transactionAmount.replace(",", "").replace("-", "").replace("+", ""));
        
        const type = transactionAmount.includes("-") ? "Expense" : "Income";
  
        transactions.push({
          date,
          description: description.trim(),
          amount,
          type,
          details: details.trim()
        });
      } else {
        console.log("Unmatched line:", line);
      }
    });
  
    // Extract ending balance
    const endingBalanceMatch = pdfText.match(/ENDING BALANCE\s*:\s*([\d,]+\.\d{2})/);
    if (endingBalanceMatch) {
      const endingBalance = parseFloat(endingBalanceMatch[1].replace(",", ""));
      transactions.push({
        date: "",  // No specific date for ending balance
        description: "ENDING BALANCE",
        amount: endingBalance,
        type: "Income",  // Treat as income for display purposes
        details: ""
      });
    }
  
    console.log("Extracted transactions:", transactions);
  
    // Step 3: Update the state with extracted transactions
    setEntries(transactions);
  };
  

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <img src={LOGO_URL} alt="Logo" className="logo" />
          <button className="toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            ☰
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active"><a href="#dashboard">Dashboard</a></li>
            <li><a href="#transactions">Transactions</a></li>
            <li><a href="#reports">Reports</a></li>
            <li><a href="#settings">Settings</a></li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <h1>Finance Tracker</h1>
          </div>
          <div className="header-right">
            <div className="search-bar">
              <input type="search" placeholder="Search transactions..." />
            </div>
            <div className="user-profile">
              <img src="https://via.placeholder.com/32" alt="Profile" className="profile-pic" />
              <div className="profile-menu">
                <span>John Doe</span>
                <button className="logout-btn">Logout</button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <div className="card">
            <div className="manual-entry-section">
              <h3>Add Transaction</h3>
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
          </div>

          <div className="card">
            <div className="upload-section">
              <h3>Upload Bank Statement</h3>
              <input type="file" accept="application/pdf" onChange={handleFileUpload} />
            </div>
          </div>

          <div className="card transactions-table">
            <h2>Recent Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Income</th>
                  <th>Expense</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>{entry.description}</td>
                    <td>{entry.type === 'Income' ? entry.amount.toFixed(2) : ''}</td>
                    <td>{entry.type === 'Expense' ? entry.amount.toFixed(2) : ''}</td>
                    <td>{entry.details}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td></td>
                  <td><strong>Total</strong></td>
                  <td>
                    <strong>
                      {entries
                        .filter(entry => entry.type === 'Income')
                        .reduce((sum, entry) => sum + entry.amount, 0)
                        .toFixed(2)}
                    </strong>
                  </td>
                  <td>
                    <strong>
                      {entries
                        .filter(entry => entry.type === 'Expense')
                        .reduce((sum, entry) => sum + entry.amount, 0)
                        .toFixed(2)}
                    </strong>
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
