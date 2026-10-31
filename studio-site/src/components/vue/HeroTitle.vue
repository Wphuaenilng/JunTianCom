<script setup lang="ts">
/**
 * Hero 主标题：Vue Bits SplitText 逐字入场
 * 「把学习写成作品」按字应用连续渐变（每个字按 nth-child 切片取色，
 * 见 global.css .grad-chars 规则），配合主题色切换。
 */
import SplitText from "./bits/SplitText.vue";
</script>

<template>
  <h1>
    <SplitText
      text="把想法做成产品，"
      :delay="40"
      :duration="1"
      tag="span"
      text-align="left"
    />
    <br />
    <SplitText
      text="把学习写成作品"
      :delay="110"
      :duration="1"
      tag="span"
      class-name="grad-chars"
      text-align="left"
    />。
  </h1>
</template>
