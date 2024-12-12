import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { 
  Flex, 
  View, 
  Button, 
  Card, 
  Heading, 
  ThemeProvider 
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import Layout from './components/Layout/Layout';
import TransactionForm from './components/Forms/TransactionForm';
import FileUploadForm from './components/Forms/FileUploadForm';
import TransactionTable from './components/TransactionTable/TransactionTable';
import { processPDFData } from './utils/pdfUtils';
import ExpensePieChart from './components/Charts/ExpensePieChart';
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
  const [showChart, setShowChart] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const handleManualAdd = (e) => {
    e.preventDefault();
    // Implement the logic to add a new transaction
    const transaction = {
      ...newTransaction,
      amount: parseFloat(newTransaction.amount)
    };
    setEntries([...entries, transaction]);
    // Reset the form
    setNewTransaction({
      date: '',
      description: '',
      amount: '',
      type: 'Expense'
    });
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
    <ThemeProvider>
      <View padding="1rem">
        <Flex direction="column" gap="1rem">
          <Heading level={1}>Expense Tracker</Heading>
          
          <Card variation="outlined">
            <Flex direction="column" gap="1rem">
              {/* Chart Section */}
              <Button 
                onClick={() => setShowChart(!showChart)}
                variation="primary"
              >
                {showChart ? 'Hide Chart' : 'Show Expense Chart'}
              </Button>
              
              {showChart && entries.length > 0 && (
                <ExpensePieChart entries={entries} />
              )}

              {/* Transaction Form Section */}
              <Button 
                onClick={() => setShowTransactionForm(!showTransactionForm)}
                variation="primary"
              >
                {showTransactionForm ? 'Hide Transaction Form' : 'Add Transaction'}
              </Button>
              
              {showTransactionForm && (
                <TransactionForm
                  newTransaction={newTransaction}
                  onInputChange={handleInputChange}
                  onSubmit={handleManualAdd}
                />
              )}

              {/* File Upload Section */}
              <Button 
                onClick={() => setShowFileUpload(!showFileUpload)}
                variation="primary"
              >
                {showFileUpload ? 'Hide File Upload' : 'Upload Bank Statement'}
              </Button>
              
              {showFileUpload && (
                <FileUploadForm onUpload={handleFileUpload} />
              )}

              <TransactionTable entries={entries} />
            </Flex>
          </Card>
        </Flex>
      </View>
    </ThemeProvider>
  );
}

export default App;
