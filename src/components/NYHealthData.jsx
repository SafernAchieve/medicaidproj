import React, { useState } from 'react';
import axios from 'axios';

function NYHealthData() {
    const [npiId, setNpiId] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        if (!npiId) {
            setError('Please enter an NPI ID');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Log the URL we're calling
            const url = `https://health.data.ny.gov/resource/keti-qx5t.json?npi=${npiId}`;
            console.log('Fetching from URL:', url);

            const response = await axios.get(url);
            console.log('API Response:', response.data);
            
            if (response.data.length === 0) {
                setError(`No data found for NPI ID: ${npiId}. Please verify the ID is correct.`);
                setData([]);
            } else {
                setData(response.data);
            }
        } catch (err) {
            console.error('API Error:', err);
            setError('Error fetching data: ' + err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const renderField = (label, value) => {
        if (value === undefined || value === null) return null;
        return (
            <p>
                <strong>{label}:</strong> {value}
            </p>
        );
    };

    return (
        <div className="ny-health-data">
            <h2>NY Health Data Provider Search</h2>
            <div className="search-container">
                <input
                    type="text"
                    value={npiId}
                    onChange={(e) => setNpiId(e.target.value)}
                    placeholder="Enter NPI ID (e.g., 1457395766)"
                    className="search-input"
                />
                <button onClick={fetchData} disabled={loading} className="search-button">
                    {loading ? 'Loading...' : 'Search'}
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {data.length > 0 && (
                <div className="results-container">
                    <h3>Results for NPI ID: {npiId}</h3>
                    <div className="results-grid">
                        {data.map((provider, index) => (
                            <div key={index} className="provider-card">
                                <h4>{provider.mmis_name}</h4>
                                <div className="provider-details">
                                    {renderField('MMIS ID', provider.mmis_id)}
                                    {renderField('NPI', provider.npi)}
                                    {renderField('Medicaid Type', provider.medicaid_type)}
                                    {renderField('Profession/Service', provider.profession_or_service)}
                                    {renderField('Provider Specialty', provider.provider_specialty)}
                                    {renderField('Service Address', provider.service_address)}
                                    {renderField('City', provider.city)}
                                    {renderField('State', provider.state)}
                                    {renderField('Zip Code', provider.zip_code)}
                                    {renderField('County', provider.county)}
                                    {renderField('Telephone', provider.telephone)}
                                    {renderField('Latitude', provider.latitude)}
                                    {renderField('Longitude', provider.longitude)}
                                    {renderField('Enrollment Begin Date', formatDate(provider.enrollment_begin_date))}
                                    {renderField('Next Anticipated Revalidation Date', formatDate(provider.next_anticipated_revalidation_date))}
                                    {renderField('Last Updated', formatDate(provider.updated))}
                                    {renderField('Medically Fragile Children Directory', provider.medically_fragile_children_directory_ind)}
                                    {renderField('Provider Email', provider.provider_email)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NYHealthData; 