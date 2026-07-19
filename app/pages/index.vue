<script setup lang="ts">
defineOptions({
  name: 'HomePage',
})
</script>

<template>
  <main class="shell">
    <section class="card">
      <p class="eyebrow">
        Personal health dashboard
      </p>
      <h1>Open Health Studio</h1>
      <p data-testid="status">
        Infrastructure ready
      </p>
    </section>
  </main>
</template>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  color: #17211b;
  background: #eef5ef;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}

.shell {
  display: grid;
  min-height: 100vh;
  padding: 2rem;
  place-items: center;
}

.card {
  width: min(100%, 42rem);
  padding: clamp(2rem, 8vw, 5rem);
  border: 1px solid #c9d9cd;
  border-radius: 1.5rem;
  background: #fff;
  box-shadow: 0 1.5rem 4rem rgb(23 33 27 / 10%);
}

.eyebrow {
  color: #38704d;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

h1 {
  margin: 0.5rem 0 1rem;
  font-size: clamp(2.5rem, 9vw, 5rem);
  letter-spacing: -0.05em;
  line-height: 0.95;
}
</style>
