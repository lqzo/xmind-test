<script setup>
import { defineComponent, ref } from "vue";
import { ElTable } from "element-plus";

defineComponent({
  "el-table": ElTable,
});

const originData = ref([]);
const columns = ref([]);
fetch("src/assets/file/bill.csv", {
  headers: {
    "Content-Type": "text/csv",
  },
}).then((res) => {
  res.text().then((text) => {
    const data = text.split("\n").map((row) => {
      return row.split(",");
    });
    const keys = data[0];
    columns.value = keys.map((key) => {
      return {
        title: key,
        key,
      };
    });
    const values = data.slice(1);
    const result = values.map((row) => {
      return keys.reduce((obj, key, index) => {
        obj[key] = row[index];
        return obj;
      }, {});
    });
    originData.value = result;
  });
});
</script>

<template>
  <el-table :data="originData" border style="width: 100%">
    <el-table-column
      v-for="(column, index) in columns"
      :key="index"
      :prop="column.key"
      :label="column.title"
      align="center"
      header-align="center"
    />
  </el-table>
</template>

<style scoped>
</style>
