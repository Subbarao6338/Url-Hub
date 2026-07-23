import React, { useState, useEffect, useCallback } from 'react';
import ToolResult from '../ToolResult';

const MarkdownTable = () => {
    // Initial states: 3 columns, 4 rows (1 header + 3 data)
    const [headers, setHeaders] = useState(['Header 1', 'Header 2', 'Header 3']);
    const [alignments, setAlignments] = useState(['left', 'center', 'right']);
    const [rows, setRows] = useState([
        ['Row 1 Col 1', 'Row 1 Col 2', 'Row 1 Col 3'],
        ['Row 2 Col 1', 'Row 2 Col 2', 'Row 2 Col 3'],
        ['Row 3 Col 1', 'Row 3 Col 2', 'Row 3 Col 3']
    ]);
    const [rawMarkdown, setRawMarkdown] = useState('');
    const [result, setResult] = useState(null);

    // Generate Markdown table from state
    const generateMarkdown = useCallback(() => {
        if (headers.length === 0) {
            setResult(null);
            return;
        }

        // Header Line
        let md = '| ' + headers.map(h => h.trim() || ' ').join(' | ') + ' |\n';

        // Divider Line based on alignments
        md += '| ' + alignments.map(align => {
            if (align === 'center') return ':---:';
            if (align === 'right') return '---:';
            return ':---';
        }).join(' | ') + ' |\n';

        // Data Rows
        rows.forEach(row => {
            const paddedRow = [...row];
            // Ensure row matches number of columns
            while (paddedRow.length < headers.length) paddedRow.push('');
            md += '| ' + paddedRow.slice(0, headers.length).map(cell => cell.trim() || ' ').join(' | ') + ' |\n';
        });

        setResult({
            text: md,
            filename: 'markdown_table.md',
            copyText: md
        });
    }, [headers, alignments, rows]);

    // Generate initially and on state change
    useEffect(() => {
        generateMarkdown();
    }, [generateMarkdown]);

    // Handle Header edit
    const handleHeaderChange = (index, value) => {
        const newHeaders = [...headers];
        newHeaders[index] = value;
        setHeaders(newHeaders);
    };

    // Handle Data Cell edit
    const handleCellChange = (rowIndex, colIndex, value) => {
        const newRows = [...rows];
        newRows[rowIndex] = [...newRows[rowIndex]];
        newRows[rowIndex][colIndex] = value;
        setRows(newRows);
    };

    // Add Column
    const addColumn = () => {
        setHeaders([...headers, `Header ${headers.length + 1}`]);
        setAlignments([...alignments, 'left']);
        setRows(rows.map(row => [...row, '']));
    };

    // Delete Column
    const deleteColumn = (index) => {
        if (headers.length <= 1) return;
        setHeaders(headers.filter((_, i) => i !== index));
        setAlignments(alignments.filter((_, i) => i !== index));
        setRows(rows.map(row => row.filter((_, i) => i !== index)));
    };

    // Add Row
    const addRow = () => {
        setRows([...rows, Array(headers.length).fill('')]);
    };

    // Delete Row
    const deleteRow = (index) => {
        if (rows.length <= 1) return;
        setRows(rows.filter((_, i) => i !== index));
    };

    // Toggle Column Alignment
    const cycleAlignment = (index) => {
        const newAligns = [...alignments];
        const current = newAligns[index];
        let next = 'left';
        if (current === 'left') next = 'center';
        else if (current === 'center') next = 'right';
        newAligns[index] = next;
        setAlignments(newAligns);
    };

    // Import/Parse Markdown Table
    const parseMarkdown = () => {
        if (!rawMarkdown.trim()) return;

        try {
            const lines = rawMarkdown.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length < 2) {
                alert("Invalid Markdown table format. A table needs at least a header row and a separator row.");
                return;
            }

            // Function to split a table row by pipe, accounting for escaped pipes
            const splitTableRow = (rowText) => {
                let text = rowText;
                if (text.startsWith('|')) text = text.slice(1);
                if (text.endsWith('|')) text = text.slice(0, -1);
                return text.split('|').map(cell => cell.trim());
            };

            const parsedHeaders = splitTableRow(lines[0]);
            const colCount = parsedHeaders.length;

            if (colCount === 0) {
                alert("Could not detect any columns in the header row.");
                return;
            }

            // Parse Alignments from second row (separator)
            const separatorCells = splitTableRow(lines[1]);
            const parsedAligns = Array(colCount).fill('left');
            for (let i = 0; i < colCount; i++) {
                const cell = separatorCells[i] || '';
                const leftColon = cell.startsWith(':');
                const rightColon = cell.endsWith(':');
                if (leftColon && rightColon) {
                    parsedAligns[i] = 'center';
                } else if (rightColon) {
                    parsedAligns[i] = 'right';
                } else {
                    parsedAligns[i] = 'left';
                }
            }

            // Parse Data Rows
            const parsedRows = [];
            const dataStartIndex = lines[1].includes('-') ? 2 : 1; // if 2nd line is divider

            for (let i = dataStartIndex; i < lines.length; i++) {
                const cells = splitTableRow(lines[i]);
                const rowData = Array(colCount).fill('');
                for (let j = 0; j < colCount; j++) {
                    rowData[j] = cells[j] || '';
                }
                parsedRows.push(rowData);
            }

            // If no data rows found, insert at least one empty row
            if (parsedRows.length === 0) {
                parsedRows.push(Array(colCount).fill(''));
            }

            setHeaders(parsedHeaders);
            setAlignments(parsedAligns);
            setRows(parsedRows);
            setRawMarkdown('');
            alert("Markdown table successfully parsed and loaded!");
        } catch (e) {
            alert("Failed to parse Markdown table. Please check format: " + e.message);
        }
    };

    const clearGrid = () => {
        setHeaders(['Header 1', 'Header 2', 'Header 3']);
        setAlignments(['left', 'center', 'right']);
        setRows([['', '', '']]);
    };

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center">Visual Markdown Table Generator</h3>
            <p className="smallest opacity-6 text-center mb-10">
                Create, format, and align Markdown tables using an interactive spreadsheet grid. You can also paste an existing Markdown table to edit it!
            </p>

            <div className="flex-between mb-10">
                <span className="smallest opacity-6 uppercase font-bold tracking-wider">Spreadsheet Editor</span>
                <div className="flex gap-10">
                    <button className="pill smallest" onClick={addColumn}>
                        <span className="material-icons mr-5" style={{ fontSize: '1rem' }}>add</span> Column
                    </button>
                    <button className="pill smallest" onClick={addRow}>
                        <span className="material-icons mr-5" style={{ fontSize: '1rem' }}>add</span> Row
                    </button>
                    <button className="pill smallest" onClick={clearGrid} style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        <span className="material-icons mr-5" style={{ fontSize: '1rem' }}>delete_sweep</span> Clear Grid
                    </button>
                </div>
            </div>

            {/* Interactive Grid Table */}
            <div className="overflow-auto max-w-full" style={{ maxHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '10px', background: 'var(--bg-surface)' }}>
                <table className="w-full font-mono text-sm" style={{ borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead>
                        {/* Headers */}
                        <tr>
                            <th style={{ width: '50px', padding: '10px', textAlign: 'center', background: 'var(--bg)', color: 'var(--text-primary)', borderBottom: '2px solid var(--border-color)' }}>#</th>
                            {headers.map((h, i) => (
                                <th key={`header-th-${i}`} style={{ padding: '8px', background: 'var(--bg)', border: '1px solid var(--border-color)', borderBottom: '2px solid var(--border-color)' }}>
                                    <div className="flex align-center gap-5">
                                        <input
                                            type="text"
                                            className="font-bold font-mono"
                                            value={h}
                                            onChange={e => handleHeaderChange(i, e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                width: '100%',
                                                textAlign: alignments[i],
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </div>
                                </th>
                            ))}
                            <th style={{ width: '50px', background: 'var(--bg)', borderBottom: '2px solid var(--border-color)' }}></th>
                        </tr>
                        {/* Alignments control and actions row */}
                        <tr style={{ background: 'var(--bg-surface)' }}>
                            <td style={{ padding: '5px', textAlign: 'center', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)' }}>
                                <span className="material-icons" style={{ fontSize: '1.1rem' }}>align_horizontal_left</span>
                            </td>
                            {alignments.map((align, i) => (
                                <td key={`align-td-${i}`} style={{ padding: '5px 8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                                    <button
                                        type="button"
                                        className="pill smallest flex-center"
                                        onClick={() => cycleAlignment(i)}
                                        style={{ margin: '0 auto', fontSize: '0.75rem', gap: '5px', textTransform: 'capitalize' }}
                                    >
                                        <span className="material-icons" style={{ fontSize: '0.9rem' }}>
                                            {align === 'left' ? 'format_align_left' : align === 'center' ? 'format_align_center' : 'format_align_right'}
                                        </span>
                                        {align}
                                    </button>
                                </td>
                            ))}
                            <td style={{ borderBottom: '1px solid var(--border-color)' }}></td>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rIdx) => (
                            <tr key={`row-${rIdx}`} style={{ background: rIdx % 2 === 0 ? 'var(--bg)' : 'var(--bg-surface)' }}>
                                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 'bold', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)' }}>
                                    {rIdx + 1}
                                </td>
                                {headers.map((_, cIdx) => (
                                    <td key={`cell-${rIdx}-${cIdx}`} style={{ padding: '4px 8px', border: '1px solid var(--border-color)' }}>
                                        <input
                                            type="text"
                                            className="font-mono w-full"
                                            value={row[cIdx] || ''}
                                            onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                outline: 'none',
                                                textAlign: alignments[cIdx],
                                                color: 'var(--text-primary)'
                                            }}
                                        />
                                    </td>
                                ))}
                                <td style={{ padding: '4px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                                    <button
                                        type="button"
                                        className="icon-btn font-bold"
                                        onClick={() => deleteRow(rIdx)}
                                        disabled={rows.length <= 1}
                                        style={{ color: 'var(--danger)', margin: '0 auto' }}
                                        title="Delete Row"
                                    >
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td style={{ padding: '10px', textAlign: 'center', borderTop: '2px solid var(--border-color)' }}></td>
                            {headers.map((_, i) => (
                                <td key={`delete-col-${i}`} style={{ padding: '5px', textAlign: 'center', borderTop: '2px solid var(--border-color)', borderRight: '1px solid var(--border-color)' }}>
                                    <button
                                        type="button"
                                        className="pill smallest flex-center"
                                        onClick={() => deleteColumn(i)}
                                        disabled={headers.length <= 1}
                                        style={{ color: 'var(--danger)', borderColor: 'var(--danger)', margin: '0 auto', fontSize: '0.7rem' }}
                                        title="Delete Column"
                                    >
                                        <span className="material-icons" style={{ fontSize: '0.9rem', marginRight: '3px' }}>delete</span> Del Col
                                    </button>
                                </td>
                            ))}
                            <td style={{ borderTop: '2px solid var(--border-color)' }}></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <hr className="my-10 opacity-2" />

            {/* Markdown Table Import/Parser */}
            <div className="grid gap-10">
                <span className="smallest opacity-6 uppercase font-bold tracking-wider text-left ml-10">Import / Parse Existing Markdown Table</span>
                <textarea
                    className="pill w-full font-mono"
                    rows="4"
                    placeholder="Paste your raw | Markdown | Table | here..."
                    value={rawMarkdown}
                    onChange={e => setRawMarkdown(e.target.value)}
                    style={{ borderRadius: '16px', padding: '15px' }}
                />
                <button type="button" className="btn-primary w-full" onClick={parseMarkdown} disabled={!rawMarkdown.trim()}>
                    <span className="material-icons mr-10">input</span>
                    Parse and Load Table
                </button>
            </div>

            <ToolResult result={result} onClear={() => setResult(null)} />
        </div>
    );
};

export default MarkdownTable;
