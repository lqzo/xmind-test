<script setup>
import { defineComponent, ref } from "vue";
import { formatDate } from "../utils";
import { ElTable } from "element-plus";

defineComponent({
  "el-table": ElTable,
});

// key name mapping
const keyNameMap = {
  id: "ID",
  time: "账单时间",
  type: "账单类型",
  amount: "账单金额",
  category: "账单分类",
  name: "分类名称",
};

// import categories data
const categories = ref([]);
fetch("src/assets/file/categories.csv", {
  headers: {
    "Content-Type": "text/csv",
  },
}).then((res) => {
  res.text().then((text) => {
    const data = text.split("\n").map((row) => {
      return row.split(",");
    });
    const keys = data[0];
    const values = data.slice(1);
    const result = values.map((row) => {
      return keys.reduce((obj, key, index) => {
        obj[key] = row[index];
        return obj;
      }, {});
    });
    categories.value = result;
  });
});

// import bill data
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
        title: keyNameMap[key],
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

/**
 * show bill data
 * @param {String} key
 * @param {String} val
 * @return {String}
 */
function showBilldata(key, val) {
  if (key === "category") {
    const category = categories.value.find((item) => {
      return item.id === val;
    });
    return category ? category.name : "";
  }
  if (key === "type") {
    return val === "1" ? "收入" : "支出";
  }
  if (key === "amount") {
    return `${val} 元`;
  }
  if (key === "time") {
    return formatDate(+val);
  }
  return val;
}
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
    >
      <template #="{ row }">
        {{ showBilldata(column.key, row[column.key]) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<style scoped>
</style>
