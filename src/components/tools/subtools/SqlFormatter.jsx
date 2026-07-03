import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const SqlFormatter = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const formatSql = () => {
        if (!input.trim()) return;
        try {
            // Protect strings from being formatted
            const strings = [];
            let sql = input.replace(/(['"])(?:(?!\1|\\).|\\.)*\1/g, (match) => {
                strings.push(match);
                return `__SQL_STR_${strings.length - 1}__`;
            });

            sql = sql.replace(/\s+/g, ' ').trim();

            const reservedWords = [
                'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'GROUP BY', 'ORDER BY',
                'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'DELETE',
                'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'OUTER JOIN',
                'ON', 'LIMIT', 'OFFSET', 'HAVING', 'JOIN', 'UNION', 'UNION ALL',
                'DISTINCT', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'NOT IN',
                'BETWEEN', 'LIKE', 'IS NULL', 'IS NOT NULL', 'INTERSECT', 'EXCEPT', 'WITH',
                'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'TRUNCATE TABLE', 'DESCRIBE',
                'EXPLAIN', 'INDEX', 'TRIGGER', 'PROCEDURE', 'FUNCTION', 'VIEW', 'DATABASE'
            ];

            // Sort reserved words by length descending to match multi-word keywords first
            const sortedReservedWords = [...reservedWords].sort((a, b) => b.length - a.length);

            // Normalize keywords to uppercase
            sortedReservedWords.forEach(word => {
                const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi');
                sql = sql.replace(regex, word.toUpperCase());
            });

            // Advanced formatting logic
            const blockKeywords = [
                'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'SET', 'VALUES',
                'INSERT INTO', 'UPDATE', 'DELETE FROM', 'DELETE', 'HAVING', 'UNION', 'UNION ALL',
                'INTERSECT', 'EXCEPT', 'WITH', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE'
            ];
            const inlineKeywords = ['AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'OUTER JOIN', 'ON'];

            const lines = [];
            let currentLine = "";
            let depth = 0;

            const tokens = sql.split(/\s+/);
            tokens.forEach(token => {
                const upperToken = token.toUpperCase();
                if (blockKeywords.includes(upperToken)) {
                    if (currentLine.trim()) lines.push(currentLine.trimEnd());
                    lines.push("  ".repeat(depth) + upperToken);
                    currentLine = "  ".repeat(depth + 1);
                } else if (inlineKeywords.includes(upperToken)) {
                    if (currentLine.trim()) lines.push(currentLine.trimEnd());
                    currentLine = "  ".repeat(depth + 1) + upperToken + " ";
                } else {
                    if (token.includes('(')) {
                        currentLine += token + " ";
                        depth++;
                    } else if (token.includes(')')) {
                        depth = Math.max(0, depth - 1);
                        currentLine += token + " ";
                    } else if (token.endsWith(',') && depth === 0) {
                        currentLine += token;
                        lines.push(currentLine.trimEnd());
                        currentLine = "  ".repeat(depth + 1);
                    } else {
                        currentLine += token + " ";
                    }
                }
            });
            if (currentLine.trim()) lines.push(currentLine.trimEnd());

            sql = lines.join('\n');

            // Restore strings
            strings.forEach((str, i) => {
                sql = sql.replace(`__SQL_STR_${i}__`, str);
            });

            const finalLines = sql.split('\n')
                .map(line => line.trimEnd())
                .filter(line => line.trim().length > 0);

            setResult({ text: finalLines.join('\n'), filename: 'formatted.sql' });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    return (
        <div className="grid gap-15">
            <div className="alert-info smallest p-10 rounded-lg opacity-8">
                <span className="material-icons v-middle mr-5" style={{fontSize:'1rem'}}>info</span>
                Beautify your SQL queries with standard indentation and keyword highlighting.
            </div>
            <textarea className="pill w-full font-mono text-sm" rows="12" style={{lineHeight: '1.5', borderRadius: '16px', padding: '15px'}} placeholder="SELECT * FROM users WHERE active = 1..." value={input} onChange={e=>setInput(e.target.value)} />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={formatSql}>
                    <span className="material-icons mr-10">format_align_left</span>
                    Format SQL
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }}>Clear</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default SqlFormatter;
