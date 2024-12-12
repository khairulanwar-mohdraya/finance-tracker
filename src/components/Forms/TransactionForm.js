import React from 'react';
import { 
  TextField, 
  SelectField, 
  Button, 
  Flex 
} from "@aws-amplify/ui-react";

function TransactionForm({ newTransaction, onInputChange, onSubmit }) {
  return (
    <Flex as="form" direction="column" gap="1rem" onSubmit={onSubmit}>
      <TextField
        label="Date"
        name="date"
        type="date"
        value={newTransaction.date}
        onChange={onInputChange}
        required
      />
      <TextField
        label="Description"
        name="description"
        value={newTransaction.description}
        onChange={onInputChange}
        required
      />
      <TextField
        label="Amount"
        name="amount"
        type="number"
        value={newTransaction.amount}
        onChange={onInputChange}
        required
      />
      <SelectField
        label="Type"
        name="type"
        value={newTransaction.type}
        onChange={onInputChange}
      >
        <option value="Expense">Expense</option>
        <option value="Income">Income</option>
      </SelectField>
      <Button type="submit" variation="primary">
        Add Transaction
      </Button>
    </Flex>
  );
}

export default TransactionForm; 