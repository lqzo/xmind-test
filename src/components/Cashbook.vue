<script setup>
import { reactive, ref, watch } from "vue";
import { formatDate } from "../utils";

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
        if (key === "type") {
          obj[key] = +row[index];
        } else {
          obj[key] = row[index];
        }
        return obj;
      }, {});
    });
    categories.value = result;
  });
});

// import bill data
const originData = reactive([]);
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
        if (key === "category") {
          obj[key] = row[index];
        } else {
          obj[key] = +row[index];
        }
        return obj;
      }, {});
    });
    originData.push(...result);
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
    return val === 1 ? "收入" : "支出";
  }
  if (key === "amount") {
    return `${val} 元`;
  }
  if (key === "time") {
    return formatDate(val);
  }
  return val;
}

const billData = ref([]);
// 月份筛选账单
const selectMonth = ref(null);
// 类型筛选账单
const selectCategory = ref("");
watch([selectMonth, selectCategory, originData], (newValues, prevValues) => {
  console.log("newValues =>", newValues, "prevValues => ", prevValues);
  const [date, category] = newValues;
  billData.value = originData.filter((item) => {
    if (date !== null) {
      const time = new Date(item.time);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      if (time.getFullYear() !== year || time.getMonth() + 1 !== month) {
        return false;
      }
    }
    if (category !== "") {
      return item.category === category;
    }
    return true;
  });
  console.log(billData.value);
});

// 新增账单
const dialogVisible = ref(false);
const billForm = ref(null);
const bill = reactive({
  time: "",
  type: "",
  amount: 0,
  category: "",
});
const resetBill = () => {
  bill.time = "";
  bill.type = "";
  bill.amount = 0;
  bill.category = "";
};
// 账单格式校验
const rules = reactive([
  {
    amount: [{ required: true, message: "请输入账单金额", trigger: "change" }],
    category: [
      { required: true, message: "请选择账单分类", trigger: "change" },
    ],
  },
]);
// 关闭添加账单弹窗
const handleClose = (done) => {
  ElMessageBox.confirm("是否要关闭弹窗重置表单?")
    .then(() => {
      resetBill();
      done();
    })
    .catch(() => {
      console.log("cancel");
    });
};
// 新增账单
const handleAdd = () => {
  // 表单校验格式
  billForm.value.validate((valid) => {
    if (valid) {
      const data = {
        ...bill,
        time: Date.now(),
      };
      originData.push(data);
      resetBill();
      ElMessage.success("添加账单成功");
      dialogVisible.value = false;
    } else {
      ElMessage.error("表单校验失败");
    }
  });
};
// 查看统计数据
const showStatistic = ref(false);
const statisticTitle = ref("");
const statisticData = reactive({
  income: 0,
  outcome: 0,
});
function openChartDialog() {
  // 计算当前数据金额 income outcome
  statisticData.income = billData.value.reduce((total, item) => {
    if (item.type === 1) {
      return total + item.amount;
    }
    return total;
  }, 0);
  statisticData.outcome = billData.value.reduce((total, item) => {
    if (item.type === 0) {
      return total + item.amount;
    }
    return total;
  }, 0);

  // 月份 或 全部订单
  const month = selectMonth.value;
  if (month) {
    statisticTitle.value = `${month.getFullYear()}年${month.getMonth() + 1}月`;
  } else {
    statisticTitle.value = "全部账单";
  }
  showStatistic.value = true;
}
</script>

<template>
  <!-- Bill Filter -->
  <div class="filter-container">
    <el-date-picker
      v-model="selectMonth"
      type="month"
      placeholder="选择月份"
      class="filter-item"
    />
    <el-select v-model="selectCategory" class="filter-item">
      <el-option label="全部" value=""></el-option>
      <el-option
        v-for="item in categories"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
    <el-button class="filter-item" @click="dialogVisible = true">
      添加账单
    </el-button>
    <el-button class="filter-item" @click="openChartDialog">查看统计</el-button>
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
  <!-- Bill dialog -->
  <el-dialog
    v-model="dialogVisible"
    title="添加账单"
    width="40%"
    :before-close="handleClose"
  >
    <el-form :model="bill" :rules="rules" ref="billForm" label-width="80px">
      <el-form-item label="账单分类">
        <el-select v-model="bill.category" key="null" placeholder="选择分类">
          <el-option
            v-for="item in categories"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="账单金额">
        <el-input-number v-model="bill.amount" />
      </el-form-item>
      <el-form-item label="账单类型">
        <el-radio-group v-model="bill.type">
          <el-radio :label="1">收入</el-radio>
          <el-radio :label="0">支出</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="handleAdd"> 确 定 </el-button>
    </template>
  </el-dialog>
  <!-- 统计数据展示弹窗 -->
  <el-dialog v-model="showStatistic" title="统计数据" width="40%">
    <el-descriptions :title="statisticTitle">
      <el-descriptions-item label="收入">
        {{ statisticData.income }}
      </el-descriptions-item>
      <el-descriptions-item label="支出">
        {{ statisticData.outcome }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer class="dialog-footer">
      <el-button @click="showStatistic = false">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.filter-container {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
}
.filter-container >>> .filter-item {
  margin-bottom: 10px;
}
.filter-item + .filter-item {
  margin-bottom: 10px;
  margin-left: 10px;
}
</style>
