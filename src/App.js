import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";
import Layout from './components/Layout/Layout';
import TransactionForm from './components/Forms/TransactionForm';
import FileUploadForm from './components/Forms/FileUploadForm';
import TransactionTable from './components/TransactionTable/TransactionTable';
import { processPDFData } from './utils/pdfUtils';
import "./App.css";

function App() {
  const [entries, setEntries] = useState([]);
  const [newTransaction, setNewTransaction] = useState({
    date: '',
    description: '',
    amount: '',
    type: 'Expense'
  });
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const handleManualAdd = (e) => {
    e.preventDefault();
    // ... existing handleManualAdd logic ...
  };

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
        const transactions = processPDFData(fullText);
        setEntries(transactions);
      };
      fileReader.readAsArrayBuffer(file);
    }
  };

  return (
    <Layout isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen}>
      <TransactionForm
        newTransaction={newTransaction}
        onInputChange={handleInputChange}
        onSubmit={handleManualAdd}
      />
      <FileUploadForm onUpload={handleFileUpload} />
      <TransactionTable entries={entries} />
    </Layout>
  );
}

export default App;
