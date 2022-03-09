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
    billData.value = result;
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

// 月份筛选账单
const selectMonth = ref(null);
const billData = ref([]);
const monthChange = (val) => {
  if (val === null) {
    billData.value = originData.value;
    return;
  }
  const month = val.getMonth() + 1;
  const year = val.getFullYear();
  const data = originData.value.filter((item) => {
    const time = new Date(+item.time);
    return time.getFullYear() === year && time.getMonth() + 1 === month;
  });
  billData.value = data;
};
</script>

<template>
  <!-- Bill Filter -->
  <div class="filter-container">
    <el-date-picker
      v-model="selectMonth"
      type="month"
      placeholder="选择月份"
      @change="monthChange"
    />
  </div>
  <!-- Bill Data Table -->
  <el-table :data="billData" border style="width: 100%">
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
.filter-container {
  display: flex;
  padding-bottom: 10px;
}
.filter-item {
  vertical-align: middle;
  margin-bottom: 10px;
}
.filter-item + .filter-item {
  margin-left: 10px;
}
</style>
