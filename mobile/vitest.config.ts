import { defineConfig } from "vitest/config";

// Only the pure logic under src/lib is tested here — it deliberately imports
// nothing from expo or react-native, so it runs in plain node with no mocking.
export default defineConfig({
  test: {
    include: ["src/lib/**/*.test.ts"],
    environment: "node",
  },
});
