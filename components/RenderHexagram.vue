<template>
    <div class="hexagram-symbol">
      <div
        v-for="(line, index) in renderedLines"
        :key="index"
        :class="['yin-yang-line', { 'moving-line': isMoving(index) }]"
      >
        <span v-if="line === 1" class="yang-line">━━━━━</span>
        <span v-else class="yin-line">━　━</span>
        <span class="line-number">({{ 6 - index }}爻)</span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed, toRefs } from 'vue';
  // import { Trigram } from '@/types';
  
  const props = defineProps({
    upper: Number,
    lower: Number,
    movingLine: Number,
  });
  
  const trigrams = {
    1: { name: '乾', symbol: '☰', lines: [1, 1, 1] },
    2: { name: '兑', symbol: '☱', lines: [1, 1, 0] },
    3: { name: '离', symbol: '☲', lines: [1, 0, 1] },
    4: { name: '震', symbol: '☳', lines: [0, 0, 1] },
    5: { name: '巽', symbol: '☴', lines: [0, 1, 1] },
    6: { name: '坎', symbol: '☵', lines: [0, 1, 0] },
    7: { name: '艮', symbol: '☶', lines: [1, 0, 0] },
    8: { name: '坤', symbol: '☷', lines: [0, 0, 0] },
  };
  
  const { upper, lower, movingLine } = toRefs(props);
  
  const renderedLines = computed(() => {
    const upperLines = trigrams[upper.value].lines;
    const lowerLines = trigrams[lower.value].lines;
    return [...lowerLines, ...upperLines].reverse();
  });
  
  const isMoving = (index) => {
    return 6 - index === movingLine.value;
  };
  </script>
  
  <style scoped>
  .hexagram-symbol {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .yin-yang-line {
    margin: 5px 0;
  }
  
  .yang-line {
    color: black;
  }
  
  .yin-line {
    color: black;
  }
  
  .line-number {
    margin-left: 10px;
  }
  
    .moving-line {
      color: red; /* Use this class to highlight moving lines */
    }
  </style>
  