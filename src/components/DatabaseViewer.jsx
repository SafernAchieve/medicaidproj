import React, { useState, useEffect } from 'react';

function DatabaseViewer() {
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/people');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const result = await response.json();
                setData(result);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    const columns = [
        { key: 'people_id', label: 'ID' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'first_name', label: 'First Name' },
        { key: 'npi_number', label: 'NPI Number' }
    ];

    return (
        <div className="database-viewer">
            <h2>People Records ({data.length})</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            {columns.map(({ key, label }) => (
                                <th key={key}>{label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, index) => (
                            <tr key={index}>
                                {columns.map(({ key }) => (
                                    <td key={key}>{row[key] !== null ? row[key].toString() : 'N/A'}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DatabaseViewer; 