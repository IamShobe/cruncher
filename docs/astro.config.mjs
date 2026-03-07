// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  site: "https://cruncher.iamshobe.com",
  integrations: [
    starlight({
      title: "Cruncher",
      logo: {
        light: "/src/assets/cruncher_full_logo.png",
        dark: "/src/assets/cruncher_full_logo.png",
        replacesTitle: true,
      },
      social: [
        { icon: "github", label: "GitHub", href: "https://github.com/IamShobe/cruncher" },
      ],
      favicon: "./src/assets/favicon.ico",
      customCss: ["./src/assets/landing.css", "./src/assets/component-overrides.css"],
      sidebar: [
        {
          label: "Getting Started",
          autogenerate: { directory: "getting-started" },
        },
        {
          label: "QQL Reference",
          items: [
            {
              label: "QQL (Quick Query Language)",
              link: "/qql-reference/01-qql",
            },
            {
              label: "Query",
              link: "/qql-reference/02-query",
            },
            {
              label: "Data Types",
              link: "/qql-reference/03-data-types",
            },
            {
              label: "Logical Expressions",
              link: "/qql-reference/04-logical-expressions",
            },
            {
              label: "Commands",
              autogenerate: { directory: "qql-reference/commands" },
            },
            {
              label: "Functions",
              items: [
                {
                  label: "Booleans",
                  autogenerate: { directory: "qql-reference/functions/booleans" },
                },
                {
                  label: "Numbers",
                  autogenerate: { directory: "qql-reference/functions/numbers" },
                },
                {
                  label: "Strings",
                  autogenerate: { directory: "qql-reference/functions/strings" },
                },
                {
                  label: "Conditional",
                  autogenerate: { directory: "qql-reference/functions/conditional" },
                },
              ],
            },
          ],
          // autogenerate: { directory: "qql-reference" },
        },
        {
          label: "Adapters",
          autogenerate: { directory: "adapters" },
        },
      ],
    }),
  ],
});
