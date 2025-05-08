#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const tar = require("tar");
const JSZip = require("jszip");
const mkdirp = require("mkdirp");

// Create fixtures directory if it doesn't exist
const fixturesDir = path.join(__dirname, "../fixtures");
const mapeosettingsDir = path.join(fixturesDir, "mapeosettings-temp");
const comapeocatDir = path.join(fixturesDir, "comapeocat-temp");

// Ensure directories exist
mkdirp.sync(fixturesDir);
mkdirp.sync(mapeosettingsDir);
mkdirp.sync(comapeocatDir);

// Sample Mapeo format data
const mapeoMetadata = {
  dataset_id: "mapeo-test",
  version: "v1.0.0",
  name: "mapeo-test-settings",
};

const mapeoPresets = {
  fields: {
    "building-type": {
      key: "building-type",
      type: "select_one",
      label: "Building type",
      placeholder: "School/hospital/etc",
      options: ["School", "Hospital", "House"],
    },
    name: {
      key: "name",
      type: "text",
      label: "Name",
      placeholder: "Common name for this place",
    },
    notes: {
      key: "notes",
      type: "textarea",
      label: "Notes",
      placeholder: "Additional information about this place",
    },
    "water-type": {
      key: "water-type",
      type: "select_one",
      label: "Water type",
      placeholder: "Type of water body",
      options: ["River", "Lake", "Ocean", "Stream"],
    },
  },
  presets: {
    building: {
      icon: "building",
      fields: ["building-type", "name", "notes"],
      geometry: ["point"],
      tags: {
        type: "building",
      },
      terms: ["structure"],
      name: "Building",
    },
    river: {
      icon: "river",
      fields: ["name", "water-type", "notes"],
      geometry: ["line"],
      tags: {
        waterway: "river",
      },
      terms: ["stream", "waterway"],
      name: "River",
    },
    lake: {
      icon: "lake",
      fields: ["name", "water-type", "notes"],
      geometry: ["area"],
      tags: {
        natural: "water",
        water: "lake",
      },
      terms: ["pond", "reservoir"],
      name: "Lake",
    },
    forest: {
      icon: "forest",
      fields: ["name", "notes"],
      geometry: ["area"],
      tags: {
        natural: "wood",
      },
      terms: ["woods", "woodland"],
      name: "Forest",
    },
    mountain: {
      icon: "mountain",
      fields: ["name", "notes"],
      geometry: ["point"],
      tags: {
        natural: "peak",
      },
      terms: ["peak", "summit"],
      name: "Mountain",
    },
  },
};

const mapeoTranslations = {
  en: {
    presets: {
      building: { name: "Building" },
      river: { name: "River" },
      lake: { name: "Lake" },
      forest: { name: "Forest" },
      mountain: { name: "Mountain" },
    },
    fields: {
      "building-type": {
        label: "Building type",
        options: {
          School: "School",
          Hospital: "Hospital",
          House: "House",
        },
        placeholder: "School/hospital/etc",
      },
      name: {
        label: "Name",
        placeholder: "Common name for this place",
      },
      notes: {
        label: "Notes",
        placeholder: "Additional information about this place",
      },
      "water-type": {
        label: "Water type",
        options: {
          River: "River",
          Lake: "Lake",
          Ocean: "Ocean",
          Stream: "Stream",
        },
        placeholder: "Type of water body",
      },
    },
    categories: {
      natural: { name: "Natural Features" },
      infrastructure: { name: "Infrastructure" },
    },
  },
  es: {
    presets: {
      building: { name: "Edificio" },
      river: { name: "Río" },
      lake: { name: "Lago" },
      forest: { name: "Bosque" },
      mountain: { name: "Montaña" },
    },
    fields: {
      "building-type": {
        label: "Tipo de edificio",
        options: {
          School: "Escuela",
          Hospital: "Hospital",
          House: "Casa",
        },
        placeholder: "Escuela/hospital/etc",
      },
      name: {
        label: "Nombre",
        placeholder: "Nombre común de este lugar",
      },
      notes: {
        label: "Notas",
        placeholder: "Información adicional sobre este lugar",
      },
      "water-type": {
        label: "Tipo de agua",
        options: {
          River: "Río",
          Lake: "Lago",
          Ocean: "Océano",
          Stream: "Arroyo",
        },
        placeholder: "Tipo de cuerpo de agua",
      },
    },
    categories: {
      natural: { name: "Características Naturales" },
      infrastructure: { name: "Infraestructura" },
    },
  },
  pt: {
    presets: {
      building: { name: "Edifício" },
      river: { name: "Rio" },
      lake: { name: "Lago" },
      forest: { name: "Floresta" },
      mountain: { name: "Montanha" },
    },
    fields: {
      "building-type": {
        label: "Tipo de edifício",
        options: {
          School: "Escola",
          Hospital: "Hospital",
          House: "Casa",
        },
        placeholder: "Escola/hospital/etc",
      },
      name: {
        label: "Nome",
        placeholder: "Nome comum deste lugar",
      },
      notes: {
        label: "Notas",
        placeholder: "Informações adicionais sobre este lugar",
      },
      "water-type": {
        label: "Tipo de água",
        options: {
          River: "Rio",
          Lake: "Lago",
          Ocean: "Oceano",
          Stream: "Riacho",
        },
        placeholder: "Tipo de corpo d'água",
      },
    },
    categories: {
      natural: { name: "Características Naturais" },
      infrastructure: { name: "Infraestrutura" },
    },
  },
};

// Sample CoMapeo format data
const comapeoMetadata = {
  name: "@mapeo/test-config",
  version: "1.0.0",
  fileVersion: "1.0",
  buildDate: "2023-08-15T12:00:00.000Z",
};

const comapeoPresets = {
  fields: {
    "building-type": {
      tagKey: "building-type",
      type: "selectOne",
      label: "Building type",
      helperText: "School/hospital/etc",
      options: [
        {
          label: "School",
          value: "School",
        },
        {
          label: "Hospital",
          value: "Hospital",
        },
        {
          label: "House",
          value: "House",
        },
      ],
      universal: false,
    },
    name: {
      tagKey: "name",
      type: "text",
      label: "Name",
      helperText: "Common name for this place",
      universal: true,
    },
    notes: {
      tagKey: "notes",
      type: "textarea",
      label: "Notes",
      helperText: "Additional information about this place",
      universal: false,
    },
    "water-type": {
      tagKey: "water-type",
      type: "selectOne",
      label: "Water type",
      helperText: "Type of water body",
      options: [
        {
          label: "River",
          value: "River",
        },
        {
          label: "Lake",
          value: "Lake",
        },
        {
          label: "Ocean",
          value: "Ocean",
        },
        {
          label: "Stream",
          value: "Stream",
        },
      ],
      universal: false,
    },
  },
  presets: {
    building: {
      terms: ["structure"],
      color: "#B209B2",
      icon: "building",
      fields: ["building-type", "name", "notes"],
      geometry: ["point"],
      tags: {
        type: "building",
      },
      name: "Building",
    },
    river: {
      terms: ["stream", "waterway"],
      color: "#0D8DEF",
      icon: "river",
      fields: ["name", "water-type", "notes"],
      geometry: ["line"],
      tags: {
        waterway: "river",
      },
      name: "River",
    },
    lake: {
      terms: ["pond", "reservoir"],
      color: "#0D8DEF",
      icon: "lake",
      fields: ["name", "water-type", "notes"],
      geometry: ["area"],
      tags: {
        natural: "water",
        water: "lake",
      },
      name: "Lake",
    },
    forest: {
      terms: ["woods", "woodland"],
      color: "#39AC39",
      icon: "forest",
      fields: ["name", "notes"],
      geometry: ["area"],
      tags: {
        natural: "wood",
      },
      name: "Forest",
    },
    mountain: {
      terms: ["peak", "summit"],
      color: "#D08F55",
      icon: "mountain",
      fields: ["name", "notes"],
      geometry: ["point"],
      tags: {
        natural: "peak",
      },
      name: "Mountain",
    },
  },
};

const comapeoTranslations = {
  en: {
    presets: {
      building: { name: "Building" },
      river: { name: "River" },
      lake: { name: "Lake" },
      forest: { name: "Forest" },
      mountain: { name: "Mountain" },
    },
    fields: {
      "building-type": {
        helperText: "Type of building structure",
        label: "Building type",
        options: {
          School: {
            label: "School",
            value: "School",
          },
          Hospital: {
            label: "Hospital",
            value: "Hospital",
          },
          House: {
            label: "House",
            value: "House",
          },
        },
        placeholder: "School/hospital/etc",
      },
      name: {
        helperText: "The common name used for this place",
        label: "Name",
        placeholder: "Common name for this place",
      },
      notes: {
        helperText: "Any additional information about this place",
        label: "Notes",
        placeholder: "Additional information about this place",
      },
      "water-type": {
        helperText: "The type of water body",
        label: "Water type",
        options: {
          River: {
            label: "River",
            value: "River",
          },
          Lake: {
            label: "Lake",
            value: "Lake",
          },
          Ocean: {
            label: "Ocean",
            value: "Ocean",
          },
          Stream: {
            label: "Stream",
            value: "Stream",
          },
        },
        placeholder: "Type of water body",
      },
    },
    categories: {
      natural: { name: "Natural Features" },
      infrastructure: { name: "Infrastructure" },
    },
  },
  es: {
    presets: {
      building: { name: "Edificio" },
      river: { name: "Río" },
      lake: { name: "Lago" },
      forest: { name: "Bosque" },
      mountain: { name: "Montaña" },
    },
    fields: {
      "building-type": {
        helperText: "Tipo de estructura de edificio",
        label: "Tipo de edificio",
        options: {
          School: {
            label: "Escuela",
            value: "School",
          },
          Hospital: {
            label: "Hospital",
            value: "Hospital",
          },
          House: {
            label: "Casa",
            value: "House",
          },
        },
        placeholder: "Escuela/hospital/etc",
      },
      name: {
        helperText: "El nombre común utilizado para este lugar",
        label: "Nombre",
        placeholder: "Nombre común de este lugar",
      },
      notes: {
        helperText: "Cualquier información adicional sobre este lugar",
        label: "Notas",
        placeholder: "Información adicional sobre este lugar",
      },
      "water-type": {
        helperText: "El tipo de cuerpo de agua",
        label: "Tipo de agua",
        options: {
          River: {
            label: "Río",
            value: "River",
          },
          Lake: {
            label: "Lago",
            value: "Lake",
          },
          Ocean: {
            label: "Océano",
            value: "Ocean",
          },
          Stream: {
            label: "Arroyo",
            value: "Stream",
          },
        },
        placeholder: "Tipo de cuerpo de agua",
      },
    },
    categories: {
      natural: { name: "Características Naturales" },
      infrastructure: { name: "Infraestructura" },
    },
  },
  pt: {
    presets: {
      building: { name: "Edifício" },
      river: { name: "Rio" },
      lake: { name: "Lago" },
      forest: { name: "Floresta" },
      mountain: { name: "Montanha" },
    },
    fields: {
      "building-type": {
        helperText: "Tipo de estrutura de edifício",
        label: "Tipo de edifício",
        options: {
          School: {
            label: "Escola",
            value: "School",
          },
          Hospital: {
            label: "Hospital",
            value: "Hospital",
          },
          House: {
            label: "Casa",
            value: "House",
          },
        },
        placeholder: "Escola/hospital/etc",
      },
      name: {
        helperText: "O nome comum usado para este lugar",
        label: "Nome",
        placeholder: "Nome comum deste lugar",
      },
      notes: {
        helperText: "Qualquer informação adicional sobre este lugar",
        label: "Notas",
        placeholder: "Informações adicionais sobre este lugar",
      },
      "water-type": {
        helperText: "O tipo de corpo d'água",
        label: "Tipo de água",
        options: {
          River: {
            label: "Rio",
            value: "River",
          },
          Lake: {
            label: "Lago",
            value: "Lake",
          },
          Ocean: {
            label: "Oceano",
            value: "Ocean",
          },
          Stream: {
            label: "Riacho",
            value: "Stream",
          },
        },
        placeholder: "Tipo de corpo d'água",
      },
    },
    categories: {
      natural: { name: "Características Naturais" },
      infrastructure: { name: "Infraestrutura" },
    },
  },
};

// Create SVG icons for all presets
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <symbol id="building-12px">
    <rect width="20" height="20" x="2" y="2" fill="#B209B2" />
  </symbol>
  <symbol id="river-12px">
    <path d="M2,12 C5,8 8,16 12,12 C16,8 19,16 22,12" stroke="#0D8DEF" stroke-width="2" fill="none" />
  </symbol>
  <symbol id="lake-12px">
    <circle cx="12" cy="12" r="10" fill="#0D8DEF" />
  </symbol>
  <symbol id="forest-12px">
    <path d="M12,2 L16,10 L20,18 L12,18 L4,18 L8,10 Z" fill="#39AC39" />
  </symbol>
  <symbol id="mountain-12px">
    <path d="M2,20 L12,4 L22,20 Z" fill="#D08F55" />
  </symbol>
</svg>`;

// Create CSS styles for all presets
const cssContent = `
.preset-building {
  color: #B209B2;
}
.preset-river {
  color: #0D8DEF;
}
.preset-lake {
  color: #0D8DEF;
}
.preset-forest {
  color: #39AC39;
}
.preset-mountain {
  color: #D08F55;
}
`;

// Create VERSION file
const versionContent = "1.0.0";

// Generate defaults.json based on preset geometries
function generateDefaults(presets) {
  // Initialize defaults object with empty arrays
  const defaults = {
    area: [],
    line: [],
    point: [],
    vertex: [],
    relation: [],
  };

  // Process each preset
  Object.entries(presets.presets).forEach(([presetKey, preset]) => {
    if (preset.geometry && Array.isArray(preset.geometry)) {
      // Add preset key to each geometry type it supports
      preset.geometry.forEach((geometry) => {
        if (defaults[geometry] && !defaults[geometry].includes(presetKey)) {
          defaults[geometry].push(presetKey);
        }
      });
    }
  });

  return defaults;
}

// Generate defaults for both formats
const mapeoDefaults = generateDefaults(mapeoPresets);
const comapeoDefaults = generateDefaults(comapeoPresets);

// Create Mapeo fixture files
fs.writeFileSync(
  path.join(mapeosettingsDir, "metadata.json"),
  JSON.stringify(mapeoMetadata, null, 2),
);
fs.writeFileSync(
  path.join(mapeosettingsDir, "presets.json"),
  JSON.stringify(mapeoPresets, null, 2),
);
fs.writeFileSync(
  path.join(mapeosettingsDir, "translations.json"),
  JSON.stringify(mapeoTranslations, null, 2),
);
fs.writeFileSync(
  path.join(mapeosettingsDir, "defaults.json"),
  JSON.stringify(mapeoDefaults, null, 2),
);
fs.writeFileSync(path.join(mapeosettingsDir, "icons.svg"), svgIcon);
fs.writeFileSync(path.join(mapeosettingsDir, "style.css"), cssContent);
fs.writeFileSync(path.join(mapeosettingsDir, "VERSION"), versionContent);

// Create icons directory and a sample PNG
fs.mkdirSync(path.join(mapeosettingsDir, "icons"), { recursive: true });
// Create a simple 1x1 pixel PNG file
const pngData = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
fs.writeFileSync(path.join(mapeosettingsDir, "icons.png"), pngData);

// Create CoMapeo fixture files
fs.writeFileSync(
  path.join(comapeocatDir, "metadata.json"),
  JSON.stringify(comapeoMetadata, null, 2),
);
fs.writeFileSync(
  path.join(comapeocatDir, "presets.json"),
  JSON.stringify(comapeoPresets, null, 2),
);
fs.writeFileSync(
  path.join(comapeocatDir, "translations.json"),
  JSON.stringify(comapeoTranslations, null, 2),
);
fs.writeFileSync(
  path.join(comapeocatDir, "defaults.json"),
  JSON.stringify(comapeoDefaults, null, 2),
);
fs.writeFileSync(path.join(comapeocatDir, "icons.svg"), svgIcon);
fs.writeFileSync(path.join(comapeocatDir, "style.css"), cssContent);
fs.writeFileSync(path.join(comapeocatDir, "VERSION"), versionContent);

// Create icons directory and a sample PNG for CoMapeo
fs.mkdirSync(path.join(comapeocatDir, "icons"), { recursive: true });
fs.writeFileSync(path.join(comapeocatDir, "icons.png"), pngData);

// Create tar archive for Mapeo settings
async function createMapeosettings() {
  console.log("Creating .mapeosettings fixture...");
  await tar.create(
    {
      gzip: true,
      file: path.join(fixturesDir, "test.mapeosettings"),
      cwd: mapeosettingsDir,
    },
    fs.readdirSync(mapeosettingsDir),
  );
  console.log(
    "Created .mapeosettings fixture at",
    path.join(fixturesDir, "test.mapeosettings"),
  );
}

// Create zip archive for CoMapeo settings
async function createComapeocat() {
  console.log("Creating .comapeocat fixture...");
  const zip = new JSZip();

  // Add all files from comapeocatDir to the zip
  const files = fs.readdirSync(comapeocatDir);
  for (const file of files) {
    const filePath = path.join(comapeocatDir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // Handle the icons directory
      const iconFiles = fs.readdirSync(filePath);
      for (const iconFile of iconFiles) {
        const iconFilePath = path.join(filePath, iconFile);
        const iconFileContent = fs.readFileSync(iconFilePath);
        zip.file(`${file}/${iconFile}`, iconFileContent);
      }
    } else {
      // Add regular files
      const fileContent = fs.readFileSync(filePath);
      zip.file(file, fileContent);
    }
  }

  // Generate the zip file
  const zipContent = await zip.generateAsync({ type: "nodebuffer" });
  fs.writeFileSync(path.join(fixturesDir, "test.comapeocat"), zipContent);
  console.log(
    "Created .comapeocat fixture at",
    path.join(fixturesDir, "test.comapeocat"),
  );
}

// Run the fixture generation
async function generateFixtures() {
  try {
    await createMapeosettings();
    await createComapeocat();

    // Clean up temporary directories
    fs.rmSync(mapeosettingsDir, { recursive: true, force: true });
    fs.rmSync(comapeocatDir, { recursive: true, force: true });

    console.log("Fixtures generated successfully!");
  } catch (error) {
    console.error("Error generating fixtures:", error);
  }
}

generateFixtures();
