<template>
  <RouterView />
</template>

<script setup lang="ts"></script>

<style>
/* Variables */
:root {
  --solid-purple: #7C4DFF;
  --off-white: #F7F7F7;
  --off-black: #170D33;
  --lama-gray: #666666;
  --base-unit: 0.5rem;
  --base-corner: 0.5rem;
}

/* Reset CSS*/
/*
  1. Use a more-intuitive box-sizing model.
*/
*, *::before, *::after {
  box-sizing: border-box;
}
/*
  2. Remove default margin
*/
* {
  margin: 0;
}
/*
  Typographic tweaks!
  3. Add accessible line-height
  4. Improve text rendering
*/
body {
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
/*
  5. Improve media defaults
*/
img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}
/*
  6. Remove built-in form typography styles
*/
input, button, textarea, select {
  font: inherit;
}
/*
  7. Avoid text overflows
*/
p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
}
/*
  8. Create a root stacking context
*/
#root, #__next {
  isolation: isolate;
}

/* Global styles */
html{
  background-color: var(--off-white);
  font-family: "Raleway", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
  color: var(--off-black);
  font-size: var(--base-unit)*2;
}

select {
  padding: var(--base-unit);
  border-radius: var(--base-corner);
  background-color: var(--off-white);
  border: 0.125rem solid var(--off-black);
}

select:active {
  border-color: var(--solid-purple);
}

</style>