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
  },
  presets: {
    building: {
      icon: "building",
      fields: ["building-type"],
      geometry: ["point"],
      tags: {
        type: "building",
      },
      terms: ["structure"],
      name: "Building",
    },
  },
};

const mapeoTranslations = {
  en: {
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
  },
  presets: {
    building: {
      terms: ["structure"],
      color: "#B209B2",
      icon: "building",
      fields: ["building-type"],
      geometry: ["point"],
      tags: {
        type: "building",
      },
      name: "Building",
    },
  },
};

const comapeoTranslations = {
  en: {
    fields: {
      "building-type": {
        helperText: "",
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
    },
  },
};

// Create a simple SVG icon
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <symbol id="building-12px">
    <rect width="20" height="20" x="2" y="2" fill="#B209B2" />
  </symbol>
</svg>`;

// Create a simple CSS file
const cssContent = `
.preset-building {
  color: #B209B2;
}
`;

// Create VERSION file
const versionContent = "1.0.0";

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
