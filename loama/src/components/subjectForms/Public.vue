<script setup lang="ts">
const onCreate = async () => {
    console.log("Public")
    return true;
}

defineExpose({
    create: onCreate
})
</script>
