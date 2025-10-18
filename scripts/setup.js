#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🔧 Setting up ReactView development environment...\n");

try {
  // Install main extension dependencies
  console.log("📦 Installing extension dependencies...");
  execSync("npm install", { stdio: "inherit" });

  // Install test app dependencies
  console.log("📦 Installing test app dependencies...");
  execSync("npm install", {
    stdio: "inherit",
    cwd: path.join(process.cwd(), "test-app")
  });

  // Compile the extension
  console.log("🔨 Compiling extension...");
  execSync("npm run compile", { stdio: "inherit" });

  // Create launch configuration if it doesn't exist
  const vscodeDir = path.join(process.cwd(), ".vscode");
  const launchPath = path.join(vscodeDir, "launch.json");

  if (!fs.existsSync(vscodeDir)) {
    fs.mkdirSync(vscodeDir);
  }

  if (!fs.existsSync(launchPath)) {
    console.log("⚙️  Creating VSCode launch configuration...");
    const launchConfig = {
      version: "0.2.0",
      configurations: [
        {
          name: "Run Extension",
          type: "extensionHost",
          request: "launch",
          args: ["--extensionDevelopmentPath=${workspaceFolder}"],
          outFiles: ["${workspaceFolder}/out/**/*.js"],
          preLaunchTask: "${workspaceFolder}/npm: compile"
        }
      ]
    };
    fs.writeFileSync(launchPath, JSON.stringify(launchConfig, null, 2));
  }

  // Create tasks configuration if it doesn't exist
  const tasksPath = path.join(vscodeDir, "tasks.json");
  if (!fs.existsSync(tasksPath)) {
    console.log("⚙️  Creating VSCode tasks configuration...");
    const tasksConfig = {
      version: "2.0.0",
      tasks: [
        {
          type: "npm",
          script: "watch",
          problemMatcher: "$tsc-watch",
          isBackground: true,
          presentation: {
            reveal: "never"
          },
          group: {
            kind: "build",
            isDefault: true
          }
        }
      ]
    };
    fs.writeFileSync(tasksPath, JSON.stringify(tasksConfig, null, 2));
  }

  console.log(`
✅ Setup complete!

To start development:
1. Run 'npm run dev' to start both extension compilation and test app
2. Press F5 in VSCode to launch the extension in development mode
3. Open a .tsx/.jsx file in the extension development host
4. Click the eye icon in the editor toolbar to preview the component

Test app will be available at: http://localhost:3000
Extension preview server: http://localhost:3001 (when active)
`);
} catch (error) {
  console.error("❌ Setup failed:", error.message);
  process.exit(1);
}
