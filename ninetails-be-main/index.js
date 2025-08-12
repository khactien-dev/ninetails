const fs = require('fs');
const path = require('path');
const deepmerge = require('deepmerge');

const loadJson = (filePath) => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};

const mergeOpenApiJson = (files) => {
  let baseSpec = loadJson(files[0]);

  for (let i = 1; i < files.length; i++) {
    let spec = loadJson(files[i]);

    // Merge paths
    baseSpec.paths = deepmerge(baseSpec.paths, spec.paths);

    // Merge components
    if (baseSpec.components && spec.components) {
      baseSpec.components = deepmerge(baseSpec.components, spec.components);
    } else if (spec.components) {
      baseSpec.components = spec.components;
    }
  }

  return baseSpec;
};

const saveJson = (data, filePath) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// List of JSON files to merge
const jsonFiles = [
  path.join(__dirname, 'form-request-swagger-spec.json'),
  path.join(__dirname, 'user-service-swagger-spec.json'),
];

// Merge JSON files
const mergedSpec = mergeOpenApiJson(jsonFiles);

// Save the merged JSON file
saveJson(mergedSpec, path.join(__dirname, 'merged_openapi.json'));

console.log('Merged OpenAPI JSON file saved as merged_openapi.json');