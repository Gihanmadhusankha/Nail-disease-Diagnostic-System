import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { fetchHistory } from '../services/apiService';

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchHistory();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    loadHistory();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Prediction History</h1>
      <table className="w-full table-auto border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Image</th>
            <th className="border p-2">Predictions</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry, i) => (
            <tr key={i}>
              <td className="border p-2 text-center">
                <img
                  src={`${API_ENDPOINTS.STATIC_UPLOADS}/${entry.filename}`}
                  alt={entry.filename}
                  className="h-24 mx-auto rounded"
                />
              </td>
              <td className="border p-2">
                <ul className="list-disc pl-4">
                  {entry.json_result.map((pred, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{pred.label}</span> - {pred.confidence}%
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border p-2">
                {new Date(entry.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;
