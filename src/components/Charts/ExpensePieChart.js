import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CATEGORY_MAPPINGS } from '../../constants/categories';
import './Charts.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ExpensePieChart = ({ entries }) => {
  // Calculate totals for each category (only expenses)
  const categoryTotals = entries
    .filter(entry => entry.type === 'Expense' && entry.category !== 'BALANCE')
    .reduce((acc, entry) => {
      if (!acc[entry.category]) {
        acc[entry.category] = 0;
      }
      acc[entry.category] += entry.amount;
      return acc;
    }, {});

  // Calculate total expenses
  const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

  // Sort categories by amount (highest to lowest)
  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .reduce((acc, [category, amount]) => {
      acc[category] = amount;
      return acc;
    }, {});

  // Prepare data for the pie chart
  const data = {
    labels: Object.keys(sortedCategories).map(category => 
      `${category} (RM${sortedCategories[category].toFixed(2)} - ${((sortedCategories[category] / totalExpenses) * 100).toFixed(1)}%)`
    ),
    datasets: [
      {
        data: Object.values(sortedCategories),
        backgroundColor: Object.keys(sortedCategories).map(category => {
          const categoryConfig = CATEGORY_MAPPINGS[category];
          return categoryConfig ? categoryConfig.color : '#808080';
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 12
          },
          padding: 20,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            const labels = chart.data.labels;
            
            return labels.map((label, i) => {
              const category = Object.keys(sortedCategories)[i];
              const categoryConfig = CATEGORY_MAPPINGS[category];
              const icon = categoryConfig?.icon || '📋';
              
              return {
                text: `${icon} ${label}`,
                fillStyle: datasets[0].backgroundColor[i],
                hidden: false,
                lineCap: 'butt',
                lineDash: [],
                lineDashOffset: 0,
                lineJoin: 'miter',
                lineWidth: 1,
                strokeStyle: datasets[0].backgroundColor[i],
                pointStyle: 'circle',
                datasetIndex: 0,
                index: i
              };
            });
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const category = Object.keys(sortedCategories)[context.dataIndex];
            const icon = CATEGORY_MAPPINGS[category]?.icon || '📋';
            const value = context.raw.toFixed(2);
            const percentage = ((context.raw / totalExpenses) * 100).toFixed(1);
            return `${icon} RM ${value} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false
  };

  return (
    <div className="chart-container">
      <h3>Expenses by Category</h3>
      <div className="chart-wrapper">
        <Pie data={data} options={options} />
      </div>
      <div className="total-expenses">
        <strong>Total Expenses: RM {totalExpenses.toFixed(2)}</strong>
      </div>
    </div>
  );
};

export default ExpensePieChart; 