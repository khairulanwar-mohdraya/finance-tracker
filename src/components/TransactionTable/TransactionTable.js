import React from 'react';
import './TransactionTable.css';

const TransactionTable = ({ entries }) => {
  return (
    <div className="card transactions-table">
      <h2>Recent Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Income</th>
            <th>Expense</th>
            <th>Balance</th>
            <th>Category</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr key={index}>
              <td>{entry.date}</td>
              <td>{entry.description}</td>
              <td>
                {entry.type === 'Income' && 
                 entry.description !== 'ENDING BALANCE' && 
                 entry.description !== 'Beginning Balance'
                  ? entry.amount.toFixed(2) 
                  : ''}
              </td>
              <td>{entry.type === 'Expense' ? entry.amount.toFixed(2) : ''}</td>
              <td>{entry.balance ? entry.balance.toFixed(2) : ''}</td>
              <td>
                <span className={`category-tag ${entry.category?.toLowerCase()}`}>
                  {entry.category || ''}
                </span>
              </td>
              <td>{entry.details}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={2}><strong>Total</strong></td>
            <td>
              <strong>
                {entries
                  .filter(entry => entry.type === 'Income' && 
                         entry.description !== 'ENDING BALANCE' &&
                         entry.description !== 'Beginning Balance')
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
            <td></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable; 