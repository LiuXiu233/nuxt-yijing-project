<template>
    <div class="container">
      <button @click="generateHexagram" v-if="!result && !loading">
        {{ loading ? '生成中...' : '获取卦象' }}
      </button>

      <div v-if="result" class="result">
        <p>农历时间：{{ result.lunarDate }}</p>

        <h3>卦象解析</h3>
        <div class="hexagram-symbol">
          <render-hexagram
            :upper="result.upper"
            :lower="result.lower"
            :moving-line="result.movingLine"
          />
        </div>
        <p>本卦：{{ result.hexagram.name }}</p>
        <p>卦辞：{{ result.hexagram.judgment }}</p>
        <p>{{ result.hexagram.xiang }}</p>

        <h3>动爻</h3>
        <p>第<span class="highlight">{{ result.movingLine }}</span>爻</p>
        <p>{{ result.hexagram.lines[result.movingLine - 1] || '无爻辞数据' }}</p>

        <h3>大师解读</h3>
        <div v-if="aiResult" class="ai-result">
          <p>{{ aiResult }}</p>
        </div>
        <div v-else-if="loading && !aiResult" class="center">
          <div>
            <IOSSpinner />
          </div>
          <p class="caption">大师正在为你解卦，请稍候...</p>
        </div>
      </div>
    </div>
  </template>

<style scoped>
button {
  font-size: 1rem;
  background: gray;
  color: white;
  padding: .75rem 1.5rem;
  cursor: pointer;
  border-radius: 0.5rem;
  border: none;
}

button:hover {
  background: rgba(128, 128, 128, 0.5);
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
}

.caption {
  font-size: 12px;
  color: gray;
}
</style>

  <script setup>
  import { ref } from 'vue';
  import { Lunar } from 'lunar-typescript';
  import hexagrams from '@/data/hexagrams';
  import RenderHexagram from '@/components/RenderHexagram.vue';

  const hourZodiacMap = [
    { start: [23, 0], end: [1, 0], zodiac: '子', num: 1 },
    { start: [1, 0], end: [3, 0], zodiac: '丑', num: 2 },
    { start: [3, 0], end: [5, 0], zodiac: '寅', num: 3 },
    { start: [5, 0], end: [7, 0], zodiac: '卯', num: 4 },
    { start: [7, 0], end: [9, 0], zodiac: '辰', num: 5 },
    { start: [9, 0], end: [11, 0], zodiac: '巳', num: 6 },
    { start: [11, 0], end: [13, 0], zodiac: '午', num: 7 },
    { start: [13, 0], end: [15, 0], zodiac: '未', num: 8 },
    { start: [15, 0], end: [17, 0], zodiac: '申', num: 9 },
    { start: [17, 0], end: [19, 0], zodiac: '酉', num: 10 },
    { start: [19, 0], end: [21, 0], zodiac: '戌', num: 11 },
    { start: [21, 0], end: [23, 0], zodiac: '亥', num: 12 }
  ];

  const trigrams = {
    1: { name: '乾', symbol: '☰', lines: [1, 1, 1] },
    2: { name: '兑', symbol: '☱', lines: [1, 1, 0] },
    3: { name: '离', symbol: '☲', lines: [1, 0, 1] },
    4: { name: '震', symbol: '☳', lines: [0, 0, 1] },
    5: { name: '巽', symbol: '☴', lines: [0, 1, 1] },
    6: { name: '坎', symbol: '☵', lines: [0, 1, 0] },
    7: { name: '艮', symbol: '☶', lines: [1, 0, 0] },
    8: { name: '坤', symbol: '☷', lines: [0, 0, 0] }
  };

  const ZodiacNumberMap = {
    子: 1, 丑: 2, 寅: 3, 卯: 4,
    辰: 5, 巳: 6, 午: 7, 未: 8,
    申: 9, 酉: 10, 戌: 11, 亥: 12
  };

  const result = ref(null);
  const aiResult = ref('');
  const loading = ref(false);

  function getCurrentZodiacHour(date) {
    const hour = date.getHours();
    const minute = date.getMinutes();

    return hourZodiacMap.find(item => {
      const [startH, startM] = item.start;
      const endH = item.end[0] === 0 ? 24 : item.end[0];
      return (
        (hour > startH || (hour === startH && minute >= startM)) &&
        (hour < endH || (hour === endH && minute < item.end[1]))
      );
    }) || hourZodiacMap[0];
  }

  async function generateHexagram() {
    loading.value = true;
    try {
      const date = new Date();
      const lunar = Lunar.fromDate(date);

      const lunarYear = lunar.getYear();
      const lunarMonth = lunar.getMonth();
      const lunarDay = lunar.getDay();
      const zodiacYearZhi = lunar.getYearZhi();

      const zodiacHour = getCurrentZodiacHour(date);

      const random = Math.floor(Math.random() * 900) + 100;
      const digits = String(random).padStart(3, '0').split('');
      const [hundreds, tens, ones] = digits.map(Number);

      const yearNum = ZodiacNumberMap[zodiacYearZhi] || 1;
      const upper = (yearNum + lunarMonth + lunarDay + hundreds) % 8 || 8;
      const lower = (yearNum + lunarMonth + lunarDay + ZodiacNumberMap[zodiacHour.zodiac] + tens) % 8 || 8;
      const movingLine = (yearNum + lunarMonth + lunarDay + ZodiacNumberMap[zodiacHour.zodiac] + ones) % 6 || 6;

      const hexagramKey = `${upper}${lower}`;
      const hexagram = hexagrams[hexagramKey] || {
        name: '未知卦',
        judgment: '无数据',
        lines: []
      };

      result.value = {
        lunarDate: `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${zodiacHour.zodiac}时`,
        random,
        upper,
        lower,
        movingLine,
        hexagram
      };

      const handleAIError = (code) => {
        const errorMap = {
          'invalid_api_key': 'AI密钥无效',
          'context_length_exceeded': '输入过长请简化',
          'rate_limit_exceeded': '请求速度过快，稍后重试'
        };

        aiResult.value = errorMap[code] || '解析服务暂时不可用';
        loading.value = false;
      };

      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `解析卦象：
          【主卦】${hexagram.name}
          【卦辞】"${hexagram.judgment}"
          【动爻】第${movingLine}爻："${hexagram.lines[movingLine - 1]}
          【象辞】"${hexagram.xiang}"
          请用专业周易知识综合分析，生成20字运势总结"`
        })
      });

      const data = await response.json();
      if (!response.ok) {
        handleAIError(data.code);
        return;
      }

      aiResult.value = data.result;
      loading.value = false;
    } catch (error) {
      console.error('Network error:', error);
    }
  }
  </script>
