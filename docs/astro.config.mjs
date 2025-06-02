// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://cruncher.iamshobe.com',
	integrations: [
		starlight({
			title: 'Cruncher',
			logo: {
				light: '/src/assets/cruncher_full_logo.png',
				dark: '/src/assets/cruncher_full_logo.png',
				replacesTitle: true,
			},
			social: {
				github: 'https://github.com/IamShobe/cruncher',
			},
			favicon: './src/assets/favicon.ico',
			customCss: ["./src/assets/landing.css"],
			sidebar: [
				{
					label: 'QQL Reference',
					autogenerate: { directory: 'qql_reference' },
				},
			],
		}),
	],
});
