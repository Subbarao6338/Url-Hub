import React, { useState, useEffect, useCallback } from 'react';
import ToolResult from '../ToolResult';

const JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN'];
const COMPARISONS = ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'IN', 'IS NULL', 'IS NOT NULL'];

const SqlBuilder = () => {
    // State for SQL components
    const [selectFields, setSelectFields] = useState('*');
    const [fromTable, setFromTable] = useState('users');

    // JOIN list
    const [joins, setJoins] = useState([]);

    // WHERE filters list
    const [filters, setFilters] = useState([]);

    // GROUP BY fields
    const [groupBy, setGroupBy] = useState('');

    // ORDER BY
    const [orderByField, setOrderByField] = useState('');
    const [orderByDirection, setOrderByFieldDirection] = useState('ASC');

    // LIMIT / OFFSET
    const [limit, setLimit] = useState('');
    const [offset, setOffset] = useState('');

    const [result, setResult] = useState(null);

    // Build the query
    const buildSql = useCallback(() => {
        let query = '';

        // SELECT
        const cleanedSelect = selectFields.trim() || '*';
        query += `SELECT ${cleanedSelect}\n`;

        // FROM
        const cleanedFrom = fromTable.trim() || 'table_name';
        query += `FROM ${cleanedFrom}`;

        // JOINs
        joins.forEach(join => {
            const table = join.table.trim();
            const condition = join.on.trim();
            if (table && condition) {
                query += `\n${join.type} ${table} ON ${condition}`;
            }
        });

        // WHERE
        if (filters.length > 0) {
            const validFilters = filters.filter(f => {
                const col = f.column.trim();
                const comp = f.operator;
                if (!col) return false;
                if (comp === 'IS NULL' || comp === 'IS NOT NULL') return true;
                return f.value.trim() !== '';
            });

            if (validFilters.length > 0) {
                query += '\nWHERE ';
                validFilters.forEach((f, idx) => {
                    const col = f.column.trim();
                    const comp = f.operator;
                    let val = f.value.trim();

                    // Format values
                    if (comp !== 'IS NULL' && comp !== 'IS NOT NULL') {
                        // Quote if string and not already quoted/number/subquery
                        const isNumeric = !isNaN(val) && val !== '';
                        const isQuoted = (val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'));
                        const isFunctionOrSubquery = val.includes('(') && val.endsWith(')');
                        if (!isNumeric && !isQuoted && !isFunctionOrSubquery) {
                            val = `'${val}'`;
                        }
                    }

                    const prefix = idx > 0 ? `  ${f.connector} ` : '';
                    if (comp === 'IS NULL' || comp === 'IS NOT NULL') {
                        query += `${prefix}${col} ${comp}\n`;
                    } else {
                        query += `${prefix}${col} ${comp} ${val}\n`;
                    }
                });
                // Remove trailing newline if present
                query = query.trimEnd();
            }
        }

        // GROUP BY
        if (groupBy.trim()) {
            query += `\nGROUP BY ${groupBy.trim()}`;
        }

        // ORDER BY
        if (orderByField.trim()) {
            query += `\nORDER BY ${orderByField.trim()} ${orderByDirection}`;
        }

        // LIMIT / OFFSET
        if (limit.trim()) {
            const limVal = parseInt(limit, 10);
            if (!isNaN(limVal)) {
                query += `\nLIMIT ${limVal}`;
            }
        }
        if (offset.trim()) {
            const offVal = parseInt(offset, 10);
            if (!isNaN(offVal)) {
                query += `\nOFFSET ${offVal}`;
            }
        }

        // Final query statement format
        query += ';';

        setResult({
            text: query,
            filename: 'query.sql',
            copyText: query
        });
    }, [selectFields, fromTable, joins, filters, groupBy, orderByField, orderByDirection, limit, offset]);

    // Build automatically when fields update
    useEffect(() => {
        buildSql();
    }, [buildSql]);

    // Join handlers
    const addJoin = () => {
        setJoins([...joins, { type: 'INNER JOIN', table: '', on: '' }]);
    };
    const updateJoin = (idx, key, val) => {
        const newJoins = [...joins];
        newJoins[idx] = { ...newJoins[idx], [key]: val };
        setJoins(newJoins);
    };
    const deleteJoin = (idx) => {
        setJoins(joins.filter((_, i) => i !== idx));
    };

    // Filter/Where handlers
    const addFilter = () => {
        setFilters([...filters, { connector: 'AND', column: '', operator: '=', value: '' }]);
    };
    const updateFilter = (idx, key, val) => {
        const newFilters = [...filters];
        newFilters[idx] = { ...newFilters[idx], [key]: val };
        setFilters(newFilters);
    };
    const deleteFilter = (idx) => {
        setFilters(filters.filter((_, i) => i !== idx));
    };

    const clearAll = () => {
        setSelectFields('*');
        setFromTable('users');
        setJoins([]);
        setFilters([]);
        setGroupBy('');
        setOrderByField('');
        setOrderByFieldDirection('ASC');
        setLimit('');
        setOffset('');
    };

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn text-left">
            <h3 className="text-center">Interactive SQL Query Builder</h3>
            <p className="smallest opacity-6 text-center mb-10">
                Visually design powerful SQL queries. Add columns, dynamic table joins, nested filters, grouping, sorting, and pagination controls.
            </p>

            <div className="grid gap-15">
                {/* SELECT & FROM */}
                <div className="grid grid-2-cols gap-15">
                    <div className="form-group text-left">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">SELECT Fields</label>
                        <input
                            className="pill w-full font-mono mt-5"
                            placeholder="e.g. id, username, email"
                            value={selectFields}
                            onChange={e => setSelectFields(e.target.value)}
                        />
                    </div>
                    <div className="form-group text-left">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">FROM Table</label>
                        <input
                            className="pill w-full font-mono mt-5"
                            placeholder="e.g. users"
                            value={fromTable}
                            onChange={e => setFromTable(e.target.value)}
                        />
                    </div>
                </div>

                <hr className="opacity-2 my-5" />

                {/* TABLE JOINS */}
                <div>
                    <div className="flex-between align-center mb-10">
                        <span className="smallest opacity-6 uppercase font-bold tracking-wider ml-10">Table Joins ({joins.length})</span>
                        <button type="button" className="pill smallest" onClick={addJoin}>
                            <span className="material-icons mr-5" style={{ fontSize: '1rem' }}>add</span> Add Join
                        </button>
                    </div>

                    {joins.length === 0 ? (
                        <div className="p-10 border rounded-lg text-center smallest opacity-5" style={{ borderStyle: 'dashed' }}>
                            No active table joins.
                        </div>
                    ) : (
                        <div className="grid gap-10">
                            {joins.map((join, idx) => (
                                <div key={`join-${idx}`} className="flex align-center gap-10 p-10 bg-surface rounded-xl border">
                                    <select
                                        className="pill smallest font-bold"
                                        value={join.type}
                                        onChange={e => updateJoin(idx, 'type', e.target.value)}
                                        style={{ minWidth: '120px' }}
                                    >
                                        {JOIN_TYPES.map(jt => <option key={join.id || jt} value={jt}>{jt}</option>)}
                                    </select>
                                    <input
                                        className="pill smallest font-mono flex-1"
                                        placeholder="Table to join"
                                        value={join.table}
                                        onChange={e => updateJoin(idx, 'table', e.target.value)}
                                    />
                                    <span className="smallest font-bold opacity-6">ON</span>
                                    <input
                                        className="pill smallest font-mono flex-2"
                                        placeholder="e.g. users.id = posts.user_id"
                                        value={join.on}
                                        onChange={e => updateJoin(idx, 'on', e.target.value)}
                                        style={{ flexGrow: 2 }}
                                    />
                                    <button type="button" className="icon-btn" onClick={() => deleteJoin(idx)} style={{ color: 'var(--danger)' }}>
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <hr className="opacity-2 my-5" />

                {/* WHERE CLAUSES */}
                <div>
                    <div className="flex-between align-center mb-10">
                        <span className="smallest opacity-6 uppercase font-bold tracking-wider ml-10">WHERE Conditions ({filters.length})</span>
                        <button type="button" className="pill smallest" onClick={addFilter}>
                            <span className="material-icons mr-5" style={{ fontSize: '1rem' }}>add</span> Add Filter
                        </button>
                    </div>

                    {filters.length === 0 ? (
                        <div className="p-10 border rounded-lg text-center smallest opacity-5" style={{ borderStyle: 'dashed' }}>
                            No active search filters (matches all records).
                        </div>
                    ) : (
                        <div className="grid gap-10">
                            {filters.map((filter, idx) => (
                                <div key={`filter-${idx}`} className="flex align-center gap-10 p-10 bg-surface rounded-xl border">
                                    {idx > 0 ? (
                                        <select
                                            className="pill smallest font-bold"
                                            value={filter.connector}
                                            onChange={e => updateFilter(idx, 'connector', e.target.value)}
                                            style={{ width: '80px' }}
                                        >
                                            <option value="AND">AND</option>
                                            <option value="OR">OR</option>
                                        </select>
                                    ) : (
                                        <div style={{ width: '80px', textAlign: 'center', fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.5 }}>WHERE</div>
                                    )}
                                    <input
                                        className="pill smallest font-mono flex-1"
                                        placeholder="Column"
                                        value={filter.column}
                                        onChange={e => updateFilter(idx, 'column', e.target.value)}
                                    />
                                    <select
                                        className="pill smallest font-mono"
                                        value={filter.operator}
                                        onChange={e => updateFilter(idx, 'operator', e.target.value)}
                                        style={{ width: '110px' }}
                                    >
                                        {COMPARISONS.map(comp => <option key={comp} value={comp}>{comp}</option>)}
                                    </select>
                                    {filter.operator !== 'IS NULL' && filter.operator !== 'IS NOT NULL' && (
                                        <input
                                            className="pill smallest font-mono flex-1"
                                            placeholder="Value"
                                            value={filter.value}
                                            onChange={e => updateFilter(idx, 'value', e.target.value)}
                                        />
                                    )}
                                    <button type="button" className="icon-btn" onClick={() => deleteFilter(idx)} style={{ color: 'var(--danger)' }}>
                                        <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <hr className="opacity-2 my-5" />

                {/* GROUP BY, ORDER BY, LIMIT */}
                <div className="grid grid-3-cols gap-15">
                    <div className="form-group text-left">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">GROUP BY</label>
                        <input
                            className="pill w-full font-mono mt-5"
                            placeholder="e.g. role"
                            value={groupBy}
                            onChange={e => setGroupBy(e.target.value)}
                        />
                    </div>
                    <div className="form-group text-left">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">ORDER BY</label>
                        <div className="flex gap-5 mt-5">
                            <input
                                className="pill font-mono flex-1"
                                placeholder="e.g. created_at"
                                value={orderByField}
                                onChange={e => setOrderByField(e.target.value)}
                            />
                            <select
                                className="pill font-mono"
                                value={orderByDirection}
                                onChange={e => setOrderByFieldDirection(e.target.value)}
                                style={{ width: '80px' }}
                            >
                                <option value="ASC">ASC</option>
                                <option value="DESC">DESC</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group text-left">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">LIMIT / OFFSET</label>
                        <div className="flex gap-5 mt-5">
                            <input
                                type="number"
                                className="pill font-mono flex-1 text-center"
                                placeholder="Limit"
                                value={limit}
                                onChange={e => setLimit(e.target.value)}
                            />
                            <input
                                type="number"
                                className="pill font-mono flex-1 text-center"
                                placeholder="Offset"
                                value={offset}
                                onChange={e => setOffset(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex mt-15 gap-10">
                    <button type="button" className="btn-primary flex-1" onClick={buildSql}>
                        <span className="material-icons mr-10">construction</span> Build SQL Query
                    </button>
                    <button type="button" className="pill" onClick={clearAll} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Reset Query
                    </button>
                </div>
            </div>

            <ToolResult result={result} onClear={() => setResult(null)} />
        </div>
    );
};

export default SqlBuilder;
