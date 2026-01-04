import type { AWSService } from '../types';

export function parseAWSServicesCSV(csvContent: string): AWSService[] {
  const lines = csvContent.split('\n');
  const services: AWSService[] = [];

  // Skip header row and process each line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV with proper handling of quoted fields
    const fields = parseCSVLine(line);

    if (fields.length >= 5) {
      services.push({
        category: fields[0],
        serviceName: fields[1],
        knowledgeDepth: parseInt(fields[2], 10) || 0,
        problemSolved: fields[3],
        scenarioAndSolution: fields[4],
      });
    }
  }

  return services;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current || line.endsWith(',')) {
    fields.push(current.trim());
  }

  return fields;
}
