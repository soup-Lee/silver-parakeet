<template>
  <section class="flex flex-col wh-full">
    <GlobalHeader
      class="z-1002 globalComponents w-full left-0 top-0 border-b border-gray-200 bg-white dark:bg-[#282c34]"
      :style="`padding-left:${activemenuWidth}px;height:${header.height}px`"
    />
    <GlobalTab
      v-if="tab.visible"
      class="z-1001 globalComponents w-full left-0 bg-white dark:bg-[#18181c]"
      :style="`height:${tab.height}px;padding-left:${activemenuWidth}px;top:${header.height}px`"
    />
    <GlobalMenu class="z-1003 globalComponents h-screen left-0 top-0 bg-white dark:bg-[#18181c]" />
    <GlobalMain
      class="z-999 w-full flex-grow transition-all duration-300 bg-gray-100 dark:bg-[#282c34] overflow-hidden"
      :style="`padding-left:${activemenuWidth}px;
      padding-top:${header.height + (tab.visible ? tab.height : 0)}px;
      height: calc(100vh - ${header.height + footer.height}px)`"
    />
    <GlobalFooter
      v-if="footer.visible"
      class="z-1002 w-screen bottom-0 bg-white dark:bg-[#2a53cd]"
      :style="`padding-left:${activemenuWidth}px;height:${footer.height}px`"
    />
  </section>
</template>

<script setup lang="ts">
import { GlobalHeader, GlobalTab, GlobalMain, GlobalMenu, GlobalFooter } from "./components";
import { useThemeStore, useAppStore } from "@/stores";

const { header, tab, sider, footer } = useThemeStore();
const app = useAppStore();

// 当前菜单宽度
const activemenuWidth = computed(() => {
  if (app.isMobile) {
    return 0;
  }
  return app.siderCollapse ? sider.collapsedWidth : sider.width;
});
</script>

<style></style>
