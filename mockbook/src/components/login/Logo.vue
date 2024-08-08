<template>
  <div class="logo-container">
    <img src="@/assets/bg-login.jpg" alt="login image" class="img" />
  </div>
</template>

<script>
export default {
  name: 'Logo'
};
</script>

<style scoped>
.img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.logo-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}
</style>
