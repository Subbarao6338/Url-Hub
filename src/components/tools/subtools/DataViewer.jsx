import React, { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const SAMPLE_EMPLOYEES = [
    { "ID": "1", "Name": "James Smith", "Department": "Engineering", "Age": "34", "Salary": "85000", "Experience": "8", "PerformanceScore": "88" },
    { "ID": "2", "Name": "Mary Johnson", "Department": "Marketing", "Age": "28", "Salary": "62000", "Experience": "4", "PerformanceScore": "82" },
    { "ID": "3", "Name": "Robert Williams", "Department": "Engineering", "Age": "45", "Salary": "120000", "Experience": "15", "PerformanceScore": "92" },
    { "ID": "4", "Name": "Patricia Brown", "Department": "HR", "Age": "31", "Salary": "58000", "Experience": "6", "PerformanceScore": "79" },
    { "ID": "5", "Name": "John Jones", "Department": "Sales", "Age": "29", "Salary": "71000", "Experience": "5", "PerformanceScore": "85" },
    { "ID": "6", "Name": "Jennifer Garcia", "Department": "Engineering", "Age": "24", "Salary": "55000", "Experience": "2", "PerformanceScore": "90" },
    { "ID": "7", "Name": "Michael Miller", "Department": "Marketing", "Age": "38", "Salary": "93000", "Experience": "10", "PerformanceScore": "87" },
    { "ID": "8", "Name": "Linda Davis", "Department": "Sales", "Age": "41", "Salary": "105000", "Experience": "12", "PerformanceScore": "89" },
    { "ID": "9", "Name": "William Rodriguez", "Department": "Engineering", "Age": "52", "Salary": "145000", "Experience": "20", "PerformanceScore": "95" },
    { "ID": "10", "Name": "Elizabeth Martinez", "Department": "HR", "Age": "36", "Salary": "72000", "Experience": "8", "PerformanceScore": "81" },
    { "ID": "11", "Name": "David Hernandez", "Department": "Sales", "Age": "33", "Salary": "78000", "Experience": "7", "PerformanceScore": "84" },
    { "ID": "12", "Name": "Barbara Lopez", "Department": "Engineering", "Age": "23", "Salary": "250000", "Experience": "1", "PerformanceScore": "98" },
    { "ID": "13", "Name": "Richard Gonzalez", "Department": "Marketing", "Age": "47", "Salary": "115000", "Experience": "16", "PerformanceScore": "91" },
    { "ID": "14", "Name": "Susan Wilson", "Department": "HR", "Age": "30", "Salary": "60000", "Experience": "5", "PerformanceScore": "80" },
    { "ID": "15", "Name": "Joseph Thomas", "Department": "Sales", "Age": "35", "Salary": "82000", "Experience": "9", "PerformanceScore": "86" }
];

const DataViewer = ({ setGlobalData, setRawFile }) => {
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setFileName(file.name);
        if (typeof setRawFile === 'function') {
            setRawFile(file);
        }

        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                if (jsonData.length > 0) {
                    setHeaders(Object.keys(jsonData[0]));
                    setData(jsonData);
                    setGlobalData(jsonData);
                }
            };
            reader.readAsArrayBuffer(file);
        } else {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                if (file.name.endsWith('.csv')) {
                    Papa.parse(content, { header: true, complete: (results) => {
                        setHeaders(results.meta.fields || []);
                        setData(results.data);
                        setGlobalData(results.data);
                    }});
                } else if (file.name.endsWith('.json')) {
                    try {
                        const jsonData = JSON.parse(content);
                        const formattedData = Array.isArray(jsonData) ? jsonData : [jsonData];
                        if (formattedData.length > 0) {
                            setHeaders(Object.keys(formattedData[0]));
                            setData(formattedData);
                            setGlobalData(formattedData);
                        }
                    } catch (e) {}
                }
            };
            reader.readAsText(file);
        }
    };

    const loadSampleDataset = () => {
        setHeaders(Object.keys(SAMPLE_EMPLOYEES[0]));
        setData(SAMPLE_EMPLOYEES);
        setGlobalData(SAMPLE_EMPLOYEES);
        setFileName('employee_sample_anomalies.csv');
        if (typeof setRawFile === 'function') {
            setRawFile(null);
        }
    };

    const clearData = () => {
        setData([]);
        setHeaders([]);
        setFileName('');
        setGlobalData(null);
        if (typeof setRawFile === 'function') {
            setRawFile(null);
        }
        const fileInput = document.getElementById('data-file');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    return (
        <div className="grid gap-15">
            <div className="card p-30 glass-card grid gap-15 text-center">
                <div className="file-input-wrapper">
                    <input type="file" id="data-file" onChange={handleFileUpload} accept=".csv,.json,.xlsx,.xls" />
                    <label htmlFor="data-file" className="file-input-label">{fileName || 'Choose CSV, JSON or Excel'}</label>
                </div>
                <div className="flex-center gap-10 flex-wrap" style={{ justifyContent: 'center' }}>
                    <button type="button" className="pill small" onClick={loadSampleDataset} style={{ background: 'var(--brand-accent)', borderColor: 'var(--brand-accent)', color: '#fff' }}>
                        <span className="material-icons mr-5" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>lightbulb</span>
                        Load Sample Employee Dataset (with Anomalies)
                    </button>
                    {data.length > 0 && (
                        <button type="button" className="pill small text-danger" onClick={clearData} style={{ borderColor: 'var(--danger)' }}>
                            <span className="material-icons mr-5" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>clear</span>
                            Clear
                        </button>
                    )}
                </div>
            </div>
            {data.length > 0 && (
                <div className="card p-0 overflow-auto glass-card animate-fadeIn" style={{ maxHeight: '350px' }}>
                    <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
                        <thead className="bg-surface sticky top-0" style={{ zIndex: 1, backgroundColor: 'var(--bg-surface)' }}>
                            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                {headers.map(h => <th key={h} className="p-10 text-left font-bold">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.slice(0, 50).map((row, i) => (
                                <tr key={i} className="border-top" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    {headers.map(h => <td key={h} className="p-8 font-mono">{String(row[h] !== undefined && row[h] !== null ? row[h] : '')}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DataViewer;
