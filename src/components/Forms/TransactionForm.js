import React from 'react';
import './Forms.css';

const TransactionForm = ({ newTransaction, onInputChange, onSubmit }) => {
  return (
    <div className="card">
      <div className="manual-entry-section">
        <h3>Add Transaction</h3>
        <form onSubmit={onSubmit}>
          <input
            type="date"
            name="date"
            value={newTransaction.date}
            onChange={onInputChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={newTransaction.description}
            onChange={onInputChange}
            required
          />
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            step="0.01"
            value={newTransaction.amount}
            onChange={onInputChange}
            required
          />
          <select
            name="type"
            value={newTransaction.type}
            onChange={onInputChange}
          >
            <option value="Expense">Expense</option>
            <option value="Income">Income</option>
          </select>
          <button type="submit">Add Transaction</button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm; 