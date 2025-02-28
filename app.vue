<template>
  <div class="container vertical-center">
    <div class="justify-center">
      <h1>周易卦象</h1>
      <HexagramGenerator />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.vertical-center {
  margin: 0;
  position: absolute;
  top: 50%;
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
}
</style>
<script setup lang="ts">
</script>
