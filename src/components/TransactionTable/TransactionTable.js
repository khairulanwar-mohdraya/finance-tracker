import React, { useState, useMemo } from 'react';
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell, 
  Text, 
  View, 
  Button,
  Flex,
  TextField,
  SelectField 
} from "@aws-amplify/ui-react";
import './TransactionTable.css';

function TransactionTable({ entries }) {
  const [expandedRow, setExpandedRow] = useState(null);
  const [sortConfig, setSortConfig] = useState({ 
    key: 'date', 
    direction: 'descending' 
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [typeFilter, setTypeFilter] = useState('All');

  // Format currency with locale-specific formatting
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate totals
  const calculateTotals = () => {
    const income = entries
      .filter(entry => entry.type === 'Income')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const expenses = entries
      .filter(entry => entry.type === 'Expense')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return { income, expenses, net: income - expenses };
  };

  // Sorting and filtering logic
  const sortedEntries = useMemo(() => {
    let sortableEntries = [...entries];
    
    // Filter by type
    if (typeFilter !== 'All') {
      sortableEntries = sortableEntries.filter(entry => entry.type === typeFilter);
    }

    // Filter entries based on search term
    if (searchTerm) {
      sortableEntries = sortableEntries.filter(entry => 
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort entries
    sortableEntries.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return sortableEntries;
  }, [entries, sortConfig, searchTerm, typeFilter]);

  // Pagination
  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedEntries, currentPage, itemsPerPage]);

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' 
        ? 'descending' 
        : 'ascending'
    }));
  };

  // Pagination controls
  const totalPages = Math.ceil(sortedEntries.length / itemsPerPage);

  // Mobile-friendly view for each row
  const MobileTransactionCard = ({ transaction, isExpanded, onToggle }) => (
    <View 
      borderWidth="1px" 
      borderRadius="medium" 
      padding="1rem" 
      marginBottom="0.5rem"
    >
      <Flex direction="column">
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontWeight="bold">{transaction.description}</Text>
          <Text 
            color={transaction.type === 'Expense' ? 'red' : 'green'}
          >
            {formatCurrency(transaction.amount)}
          </Text>
          <Button 
            size="small" 
            variation="link"
            onClick={onToggle}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </Flex>
        
        {isExpanded && (
          <Flex direction="column" marginTop="0.5rem">
            <Text>Date: {transaction.date}</Text>
            <Text>Type: {transaction.type}</Text>
            <Text>Details: {transaction.details}</Text>
          </Flex>
        )}
      </Flex>
    </View>
  );

  // Responsive rendering based on screen size
  const ResponsiveTransactionView = () => {
    return paginatedEntries.map((transaction, index) => (
      <MobileTransactionCard 
        key={index}
        transaction={transaction}
        isExpanded={expandedRow === index}
        onToggle={() => 
          setExpandedRow(expandedRow === index ? null : index)
        }
      />
    ));
  };

  // Desktop table view
  const DesktopTransactionTable = () => {
    const totals = calculateTotals();

    return (
      <>
        {/* Totals Summary */}
        <Flex 
          justifyContent="space-between" 
          marginBottom="1rem" 
          padding="1rem" 
          backgroundColor="rgba(0,0,0,0.05)"
        >
          <Text>
            Total Income: 
            <Text as="span" color="green" fontWeight="bold">
              {' '}{formatCurrency(totals.income)}
            </Text>
          </Text>
          <Text>
            Total Expenses: 
            <Text as="span" color="red" fontWeight="bold">
              {' '}{formatCurrency(totals.expenses)}
            </Text>
          </Text>
          <Text>
            Net: 
            <Text 
              as="span" 
              color={totals.net >= 0 ? 'green' : 'red'} 
              fontWeight="bold"
            >
              {' '}{formatCurrency(totals.net)}
            </Text>
          </Text>
        </Flex>

        {/* Search and Filter */}
        <Flex 
          marginBottom="1rem" 
          gap="1rem" 
          alignItems="center"
          justifyContent="space-between"
        >
          <TextField
            placeholder="Search transactions"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="45%"
          />
          <SelectField
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1); // Reset to first page
            }}
            width="25%"
          >
            <option value="All">All Types</option>
            <option value="Expense">Expenses</option>
            <option value="Income">Income</option>
          </SelectField>
          <SelectField
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page
            }}
            width="25%"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </SelectField>
        </Flex>

        {/* Table */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('date')}
                style={{ cursor: 'pointer' }}
              >
                Date 
                {sortConfig.key === 'date' && 
                  (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('description')}
                style={{ cursor: 'pointer' }}
              >
                Description
                {sortConfig.key === 'description' && 
                  (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('amount')}
                style={{ cursor: 'pointer' }}
              >
                Amount
                {sortConfig.key === 'amount' && 
                  (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </TableCell>
              <TableCell 
                onClick={() => handleSort('type')}
                style={{ cursor: 'pointer' }}
              >
                Type
                {sortConfig.key === 'type' && 
                  (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼')}
              </TableCell>
              <TableCell>Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntries.map((transaction, index) => (
              <TableRow key={index}>
                <TableCell>{transaction.date}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell 
                  color={transaction.type === 'Expense' ? 'red' : 'green'}
                >
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>{transaction.type}</TableCell>
                <TableCell>
                  <Text>{transaction.details || 'No details available'}</Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          marginTop="1rem"
        >
          <Button
            variation="secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text margin="0 1rem">
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            variation="secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </>
    );
  };

  return (
    <View>
      {/* Mobile View - Hidden on larger screens */}
      <View 
        display={['block', 'block', 'none']} 
        padding="1rem"
      >
        <ResponsiveTransactionView />
        {/* Pagination for Mobile */}
        <Flex 
          justifyContent="center" 
          alignItems="center" 
          marginTop="1rem"
        >
          <Button
            variation="secondary"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text margin="0 1rem">
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            variation="secondary"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </View>

      {/* Desktop View - Hidden on mobile screens */}
      <View 
        display={['none', 'none', 'block']} 
        overflowX="auto"
      >
        <DesktopTransactionTable />
      </View>
    </View>
  );
}

export default TransactionTable; 