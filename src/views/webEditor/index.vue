<template>
  <div class="wh-full overflow-hidden flex flex-col">
    <section class="flex box-border wh-full overflow-hidden">
      <div class="flex flex-1 flex-col">
        <nav class="pl-8">
          <n-tabs type="line">
            <n-tab
              v-for="(item, index) in webCodeStore.getTeamplateModes"
              :key="index"
              :name="item"
              @click="changeMode(index)"
            >
              {{ item }}
            </n-tab>
          </n-tabs>
        </nav>
        <div id="editorHeight" class="flex-1">
          <div
            v-for="(item, index) in editorModes"
            :key="index"
            class="overflow-hidden"
            :style="
              index === editorActiveIndex
                ? `height:calc(100vh - ${theme.header.height + theme.footer.height + 42}px)`
                : ''
            "
          >
            <div
              v-if="index === editorActiveIndex"
              ref="scrollBar"
              class="h-full overflow-x-hidden"
              :style="`width:${editorWidth - 6}px`"
            >
              <Editor
                :id="'editor'"
                ref="editorRef"
                :width="editorWidth"
                :language="getLanguage(item)"
                :model-value="editorCode"
                :setup="item === 'HTML' ? htmlSetup : basicSetup"
                @change-code="changeCode"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- resizeBar -->
      <div
        class="w-[6px] h-full transition-colors duration-300 cursor-w-resize"
        :class="editorStates.resizeBarShow ? 'bg-[#5e9cfb]' : 'bg-[#282c34]'"
        @mousedown="resizeResultBoxWidth"
      ></div>
      <div ref="ASideRef" class="h-full bg-[#282c34]" :style="`width:${resultBoxWidth - 12}px;`">
        <Iframe :width="resultBoxWidth" :height="iframeHeight" :is-visible="editorStates"></Iframe>
        <Console
          :width="resultBoxWidth"
          :height="consoleHeight"
          @minimal-console="minimalConsole"
          @resize-console="resizeConsoleHeight"
        ></Console>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useWebCodes } from "@/hooks/webEditor/useWebCodes";
import { html } from "@codemirror/lang-html";
import { css } from "@codemirror/lang-css";
import { javascript } from "@codemirror/lang-javascript";
import { htmlSetup, basicSetup } from "@/components/editor/setup";
import type { LanguageSupport } from "@codemirror/language";
// import { oneDarkTheme } from "@codemirror/theme-one-dark";
import { useMouse } from "@vueuse/core";
import type { State } from "@/types/editor";
import { useAppStore, useThemeStore } from "@/stores";
import { useUpLoadState } from "@/hooks/webEditor/useUpLoadState";

const app = useAppStore();
const theme = useThemeStore();
// ?????????????????????????????????
app.setSiderCollapse(false);
// ?????????????????????
theme.setDarkMode(true);

// ???????????????

const editorRef = ref(null);
const scrollBar = ref<HTMLElement>(null); //??????editor????????????
const webCodeStore = useWebCodes();
const upLoadState = useUpLoadState();
const changeMode = (index: number) => {
  const anchor = editorRef.value[0].getEditorCusorPos(); //??????????????????????????????????????????
  const scroll = scrollBar.value[0]; //???????????????????????????????????????
  webCodeStore.setScrollTop(scroll.scrollLeft, scroll.scrollTop, editorActiveIndex.value);
  webCodeStore.setCursorPosition(anchor, editorActiveIndex.value);
  webCodeStore.setIndex(index);
};

const consoleHeight = ref<number>(0); //???????????????
const ASideRef = ref<HTMLElement>(null); //iframe+???????????????
const iframeHeight = ref<number>(480);
const editorWidth = ref<number>(0);
const resultBoxWidth = ref<number>(0);

const watchWidthandHeight = () => {
  editorWidth.value = document.body.clientWidth / 2;
  resultBoxWidth.value = document.body.clientWidth - editorWidth.value - 60;
}; //?????????????????????

const editorActiveIndex = computed(() => webCodeStore.index);
const editorModes = computed(() => webCodeStore.getTeamplateModes);
const editorCode = computed(() => webCodeStore.getModeCode);
/** ???????????????editor??? */

const isUpload = computed(() => upLoadState.isUpLoad); //????????????(????????????????????????????????????????????????)

const { x, y } = useMouse(); //vueuse??????document????????????x,y???
const editorStates = ref<State>({
  iframeVisible: false,
  iframeWidthShow: false,
  resizeBarShow: false,
}); //????????????
const clearDocumentEvent = () => {
  document.onmouseup = () => {
    editorStates.value.iframeVisible = false;
    editorStates.value.iframeWidthShow = false;
    editorStates.value.resizeBarShow = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };
};
const resizeConsoleHeight = () => {
  editorStates.value.iframeVisible = true;
  const startY = y.value;
  const consoleH = consoleHeight.value;
  const viewHeight = consoleHeight.value + iframeHeight.value;
  document.onmousemove = () => {
    const finH: number = consoleH - y.value + startY;
    if (finH > -7 && viewHeight - finH > 42) {
      consoleHeight.value = finH;
      iframeHeight.value = viewHeight - finH;
    }
    clearDocumentEvent();
  };
};

/**
 * @param leftborder ?????????
 * @param rightBorder ?????????
 */
const resizeResultBoxWidth = () => {
  const leftborder = 240,
    rightBorder = 180;
  editorStates.value.iframeVisible = true;
  editorStates.value.iframeWidthShow = true;
  editorStates.value.resizeBarShow = true;
  const startX = x.value;
  const resultBoxW = resultBoxWidth.value;
  const editorW = editorWidth.value;
  const viewWidth = resultBoxW + editorW;
  document.onmousemove = () => {
    const finW: number = editorW + x.value - startX - 6;
    if (finW > leftborder && viewWidth - finW > rightBorder) {
      editorWidth.value = finW;
      resultBoxWidth.value = viewWidth - finW;
    }
    clearDocumentEvent();
  };
};

const minimalConsole = () => {
  //??????????????????
  const viewHeight = consoleHeight.value + iframeHeight.value;
  consoleHeight.value = -7;
  iframeHeight.value = viewHeight - consoleHeight.value;
};

const getLanguage = (language: string): LanguageSupport => {
  switch (language) {
    case "HTML":
      return html();
    case "JavaScript":
      return javascript();
    case "CSS":
      return css();
  }
};

const changeCode = (newCode: string) => {
  webCodeStore.setModeCode(newCode);
};

onMounted(() => {
  watchWidthandHeight();
  iframeHeight.value = ASideRef.value.firstElementChild.clientHeight;
  consoleHeight.value = ASideRef.value.scrollHeight - iframeHeight.value - 34;
  window.addEventListener("resize", watchWidthandHeight);
  watch(
    () => editorActiveIndex.value,
    () => {
      nextTick(() => {
        const { x, y } = webCodeStore.getScroll;
        scrollBar.value[0].scrollTo(x, y);
        editorRef.value[0].refreshEditorDoc(editorCode.value);
      });
    },
  );
});
</script>

<style></style>
