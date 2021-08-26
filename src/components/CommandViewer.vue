<template>
  <div class="ml-5 pl-2" :class="{ 'mb-2': isCommand }">
    <div class="flex-container">
      <span>
        <span
          :class="{
            'text-decoration-underline': !isCommand,
            'font-weight-medium': isCommand,
          }"
          >{{ item.name }}</span
        >
        <span v-if="!isCommand" class="caption font-weight-light ml-2">
          (type: {{ item.type }},
          {{ item.required ? "required" : "NOT required" }})
        </span>
      </span>
      <span class="fill-flex-space font-weight-thin mx-4">
        - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      </span>
      <span class="ml-auto body-2" :class="{ 'font-weight-bold': !isCommand }"
        >( {{ item.description }} )</span
      >
    </div>
    <command-viewer
      v-for="option in item.options"
      :key="option.name"
      :item="option"
    />
  </div>
</template>

<script>
export default {
  name: "command-viewer",
  computed: {
    isCommand() {
      return (
        this.item.type === "SUB_COMMAND_GROUP" ||
        this.item.type === "SUB_COMMAND"
      );
    },
    hasOptions() {
      return this.item.options && this.item.options.length > 0;
    },
  },
  props: {
    item: { type: Object, required: true },
  },
};
</script>

<style lang="scss" scoped>
.flex-container {
  display: flex;
  justify-content: space-between;
}
.fill-flex-space {
  flex: 1;
  /* Required for text-overflow to do anything */
  white-space: nowrap;
  overflow: hidden;
}
</style>
