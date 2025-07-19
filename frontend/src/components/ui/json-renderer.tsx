import React from 'react';
import { Badge } from './badge';

interface JsonRendererProps {
  data: any;
  className?: string;
  source: string;
}

interface JsonValueProps {
  value: any;
  key?: string;
  level?: number;
}

const JsonValue: React.FC<JsonValueProps> = ({ value, key, level = 0 }) => {
  const indent = level * 16; // 16px indent per level

  if (value === null) {
    return <span className="text-gray-500 italic">null</span>;
  }

  if (typeof value === 'undefined') {
    return <span className="text-gray-500 italic">undefined</span>;
  }

  if (typeof value === 'boolean') {
    return <span className="text-blue-600 font-medium">{value.toString()}</span>;
  }

  if (typeof value === 'number') {
    return <span className="text-green-600 font-medium">{value}</span>;
  }

  if (typeof value === 'string') {
    return <span className="text-orange-600">"{value}"</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div style={{ marginLeft: indent }}>
        <span className="text-purple-600 font-medium">[</span>
        <ul className="list-none m-0 p-0">
          {value.map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <JsonValue value={item} level={level + 1} />
              {index < value.length - 1 && <span className="text-gray-400">,</span>}
            </li>
          ))}
        </ul>
        <span className="text-purple-600 font-medium">]</span>
      </div>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value);
    
    return (
      <div style={{ marginLeft: indent }}>
        <span className="text-purple-600 font-medium">{'{'}</span>
        <ul className="list-none m-0 p-0">
          {entries.map(([k, v], index) => (
            <li key={k} className="flex items-start">
              <span className="text-gray-400 mr-2">•</span>
              <span className="text-blue-800 font-medium mr-2">"{k}":</span>
              <JsonValue value={v} level={level + 1} />
              {index < entries.length - 1 && <span className="text-gray-400">,</span>}
            </li>
          ))}
        </ul>
        <span className="text-purple-600 font-medium">{'}'}</span>
      </div>
    );
  }

  return <span className="text-gray-700">{String(value)}</span>;
};

export const JsonRenderer: React.FC<JsonRendererProps> = ({ data, className = '', source }) => {
  return (
    <>
      <Badge variant="outline">{source}</Badge>
      <div className={`json-renderer font-mono text-sm ${className}`}>
        <JsonValue value={data} />
      </div>
    </>
  );
};

export default JsonRenderer; 