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

            // Normalize whitespace
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

            const sortedReservedWords = [...reservedWords].sort((a, b) => b.length - a.length);

            sortedReservedWords.forEach(word => {
                const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi');
                sql = sql.replace(regex, word.toUpperCase());
            });

            const blockKeywords = [
                'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'SET', 'VALUES',
                'INSERT INTO', 'UPDATE', 'DELETE FROM', 'DELETE', 'HAVING', 'UNION', 'UNION ALL',
                'INTERSECT', 'EXCEPT', 'WITH', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE TABLE'
            ];
            const inlineKeywords = ['AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'OUTER JOIN', 'ON'];

            const lines = [];
            let currentLine = "";
            let depth = 0;

            // Tokenize by spaces but keep parentheses and commas as separate tokens
            const tokens = sql.replace(/([(),])/g, ' $1 ').split(/\s+/).filter(t => t.length > 0);

            tokens.forEach((token, idx) => {
                const upperToken = token.toUpperCase();

                if (blockKeywords.includes(upperToken)) {
                    if (currentLine.trim()) lines.push(currentLine.trimEnd());
                    lines.push("  ".repeat(depth) + upperToken);
                    currentLine = "  ".repeat(depth + 1);
                } else if (inlineKeywords.includes(upperToken)) {
                    if (currentLine.trim()) lines.push(currentLine.trimEnd());
                    currentLine = "  ".repeat(depth) + upperToken + " ";
                } else if (token === '(') {
                    currentLine += "( ";
                    depth++;
                    lines.push(currentLine.trimEnd());
                    currentLine = "  ".repeat(depth);
                } else if (token === ')') {
                    if (currentLine.trim()) lines.push(currentLine.trimEnd());
                    depth = Math.max(0, depth - 1);
                    currentLine = "  ".repeat(depth) + ") ";
                } else if (token === ',') {
                    currentLine = currentLine.trimEnd() + ",";
                    if (depth === 1) { // Common in SELECT or GROUP BY at top level of block
                        lines.push(currentLine);
                        currentLine = "  ".repeat(depth);
                    } else {
                        currentLine += " ";
                    }
                } else {
                    currentLine += token + " ";
                }
            });

            if (currentLine.trim()) lines.push(currentLine.trimEnd());

            let finalSql = lines.join('\n');

            // Restore strings
            strings.forEach((str, i) => {
                finalSql = finalSql.replace(`__SQL_STR_${i}__`, str);
            });

            const finalLines = finalSql.split('\n')
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
                Refined SQL formatter with better subquery and multi-column support.
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
