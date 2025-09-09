import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Remove backslashes and leading/trailing quotes
function clean(str: string): string {
  return str.replace(/\\/g, '').replace(/^"+|"+$/g, '');
}

function csvToJson(csvFilePath: string): object[] {
  const csvData = fs.readFileSync(csvFilePath, 'utf-8');
  const lines = csvData.trim().split('\n');

  const headers = lines[0].split(',').map(h => clean(h.trim()));

  const jsonArray = lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: { [key: string]: string } = {};
    headers.forEach((header, i) => {
      obj[header] = clean(values[i]?.trim() ?? '');
    });
    return obj;
  });

  return jsonArray;
}

// Usage example
const csvPath = path.join(__dirname, 'real_estate_main.csv');
const jsonPath = path.join(__dirname, 'real_estate_main.json');
const jsonData = csvToJson(csvPath);

// Save JSON to file
fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
console.log(`JSON saved to ${jsonPath}`);
