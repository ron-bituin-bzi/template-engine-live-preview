<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card elevation="4" class="pa-8 text-center">
          <v-icon size="80" color="primary" class="mb-4">mdi-file-document-edit-outline</v-icon>
          <h1 class="text-h3 mb-4">Template Engine</h1>
          <p class="text-h6 text-medium-emphasis mb-6">
            Build insurance product question sets visually
          </p>
          
          <v-btn
            to="/builder"
            color="primary"
            size="x-large"
            prepend-icon="mdi-plus-circle"
            class="mr-3 mb-3"
          >
            Start Building
          </v-btn>
          <v-btn
            to="/builder?mode=edit"
            color="secondary"
            size="x-large"
            prepend-icon="mdi-file-edit-outline"
            class="mb-3"
          >
            Edit Existing Questions
          </v-btn>

          <v-divider class="my-6" />

          <div class="text-body-2 text-medium-emphasis">
            Create questions, generate configuration files, and manage product templates
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  //
</script>
