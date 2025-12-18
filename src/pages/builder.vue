<template>
  <v-container fluid class="pa-6">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Question Set Builder</h1>
        <p class="text-body-1 mb-6">Create insurance product questions and generate configuration files</p>
      </v-col>
    </v-row>

    <!-- Question Form -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <div class="d-flex justify-space-between align-center mb-4">
            <div class="text-h6">Add New Question</div>
            <v-btn
              icon="mdi-upload"
              variant="text"
              size="small"
              @click.stop="openUploadDialog"
            />
          </div>
          
          <v-form ref="questionForm">
            <v-text-field
              v-model="newQuestion.jsonPath"
              label="Field Name (JSON Path)"
              hint="e.g., InsuredName, ABN, BusinessTradingName"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.questionLabel"
              label="Question Label"
              hint="Displayed as the question text"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.controlLabel"
              label="Control Label"
              hint="Label for the input field"
              persistent-hint
              density="comfortable"
              class="mb-3"
            />

            <v-select
              v-model="newQuestion.inputType"
              :items="inputTypes"
              label="Input Type"
              density="comfortable"
              class="mb-3"
            />

            <v-text-field
              v-model="newQuestion.section"
              label="Section"
              hint="e.g., BusinessDetails, UnderwritingCriteria"
              persistent-hint
              density="comfortable"
              class="mb-4"
            />

            <div class="d-flex">
              <v-btn
                color="primary"
                @click="addQuestion"
                size="large"
                class="mr-3"
              >
                {{ editingIndex !== null ? 'Update Question' : 'Add Question' }}
              </v-btn>
              <v-btn
                v-if="editingIndex !== null"
                color="error"
                @click="cancelEdit"
                size="large"
              >
                Cancel
              </v-btn>
            </div>
          </v-form>
        </v-card>
      </v-col>

      <!-- Questions List -->
      <v-col cols="12" md="6">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h6 pa-0 mb-4">
            Questions ({{ questions.length }})
          </v-card-title>

          <v-list v-if="questions.length > 0" class="mb-4">
            <v-list-item
              v-for="(question, index) in questions"
              :key="index"
              class="px-0"
              :class="{ 'bg-primary-lighten-5': editingIndex === index }"
              @click="selectQuestion(index)"
              style="cursor: pointer;"
            >
              <template v-slot:prepend>
                <v-icon :color="editingIndex === index ? 'error' : 'default'">
                  {{
                    editingIndex === index ? 'mdi-pencil' : (
                      {
                        'text': 'mdi-form-textbox',
                        'number': 'mdi-numeric',
                        'dropdown': 'mdi-form-select',
                        'radio': 'mdi-radiobox-marked',
                        'date': 'mdi-calendar-range',
                        'textarea': 'mdi-form-textarea',
                        'checkbox': 'mdi-checkbox-marked'
                      }[question.inputType] || 'mdi-help-circle-outline'
                    )
                  }}
                </v-icon>
              </template>
              <v-list-item-title>{{ question.questionLabel }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ question.jsonPath }} • {{ question.inputType }} • Section: {{ question.section }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-btn
                  icon="mdi-delete"
                  size="small"
                  variant="text"
                  @click.stop="removeQuestion(index)"
                />
              </template>
            </v-list-item>
          </v-list>

          <v-alert v-else type="info" variant="tonal">
            No questions added yet. Add your first question using the form.
          </v-alert>

          <v-divider class="my-4" />

          <div class="d-flex flex-wrap">
            <v-btn
              color="success"
              :disabled="questions.length === 0"
              @click="downloadQuestionsJson"
              prepend-icon="mdi-download"
              class="mr-3 mb-2"
            >
              Download questions.json
            </v-btn>
            <v-btn
              color="success"
              :disabled="questions.length === 0"
              @click="downloadMappingJson"
              prepend-icon="mdi-download"
              class="mb-2"
            >
              Download mapping.json
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Preview Section -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="2" class="pa-4">
          <v-card-title class="text-h6 pa-0 mb-4">JSON Preview</v-card-title>
          
          <v-tabs v-model="previewTab" class="mb-4">
            <v-tab value="questions">questions.json</v-tab>
            <v-tab value="mapping">mapping.json</v-tab>
          </v-tabs>

          <v-window v-model="previewTab">
            <v-window-item value="questions">
              <pre class="code-preview">{{ JSON.stringify(generateQuestionsJson(), null, 2) }}</pre>
            </v-window-item>
            <v-window-item value="mapping">
              <pre class="code-preview">{{ JSON.stringify(generateMappingJson(), null, 2) }}</pre>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload Dialog -->
    <v-dialog v-model="uploadDialog" max-width="600" persistent>
      <v-card>
        <v-card-title class="text-h6">Import Questions from JSON</v-card-title>
        <v-card-text>
          <v-file-input
            v-model="questionsFile"
            label="Upload questions.json"
            accept=".json"
            prepend-icon="mdi-file-code"
            class="mb-4"
            @click:clear="questionsFile = null"
          />
          <v-file-input
            v-model="mappingFile"
            label="Upload mapping.json"
            accept=".json"
            prepend-icon="mdi-file-code"
            @click:clear="mappingFile = null"
          />
          <v-alert v-if="uploadError" type="error" class="mt-4">
            {{ uploadError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="uploadDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="importJsonFiles"
            :disabled="!questionsFile || !mappingFile"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'

  const route = useRoute()

  const inputTypes = ['text', 'number', 'dropdown', 'radio', 'checkbox', 'date', 'textarea']

  const newQuestion = ref({
    jsonPath: '',
    questionLabel: '',
    controlLabel: '',
    inputType: 'text',
    section: 'BusinessDetails'
  })

  const questions = ref([])
  const previewTab = ref('questions')
  const editingIndex = ref(null)
  const uploadDialog = ref(false)
  const questionsFile = ref(null)
  const mappingFile = ref(null)
  const uploadError = ref('')

  const openUploadDialog = () => {
    console.log('Opening upload dialog')
    uploadError.value = ''
    questionsFile.value = null
    mappingFile.value = null
    uploadDialog.value = true
  }

  onMounted(() => {
    // Open upload dialog if coming from "Edit Existing Questions"
    if (route.query.mode === 'edit') {
      uploadDialog.value = true
    }
  })

  const addQuestion = () => {
    if (!newQuestion.value.jsonPath || !newQuestion.value.questionLabel) {
      return
    }

    if (editingIndex.value !== null) {
      // Update existing question
      questions.value[editingIndex.value] = { ...newQuestion.value }
      editingIndex.value = null
    } else {
      // Add new question
      questions.value.push({ ...newQuestion.value })
    }

    // Reset form
    resetForm()
  }

  const selectQuestion = (index) => {
    editingIndex.value = index
    newQuestion.value = { ...questions.value[index] }
  }

  const cancelEdit = () => {
    editingIndex.value = null
    resetForm()
  }

  const resetForm = () => {
    newQuestion.value = {
      jsonPath: '',
      questionLabel: '',
      controlLabel: '',
      inputType: 'text',
      section: 'BusinessDetails'
    }
  }

  const removeQuestion = (index) => {
    if (editingIndex.value === index) {
      cancelEdit()
    } else if (editingIndex.value !== null && editingIndex.value > index) {
      editingIndex.value--
    }
    questions.value.splice(index, 1)
  }

  const generateQuestionsJson = () => {
    const questionsObj = {}
    
    questions.value.forEach(q => {
      questionsObj[q.jsonPath] = {
        JsonPath: q.jsonPath,
        QuestionLabel: q.questionLabel,
        Document: {
          DocVisible: ["SCD", "PRP", "COC"],
          DocOrder: Object.keys(questionsObj).length + 1,
          DocumentTitle: q.questionLabel
        },
        ControlLabel: q.controlLabel || q.questionLabel,
        InputType: q.inputType,
        DefaultValue: "",
        AvailableValue: "",
        Prerequisite: "",
        PrerequisiteJoiner: "",
        AdditionalProperties: [],
        DataSource: "",
        Validation: [],
        HintText: null,
        HelpText: null,
        ResponseXPath: `$.Response.${q.section}.${q.jsonPath}`,
        DataType: "",
        DataTypePath: "",
        ArrayTitle: ""
      }
    })

    return questionsObj
  }

  const generateMappingJson = () => {
    const sectionMap = {}
    
    // Group questions by section
    questions.value.forEach(q => {
      if (!sectionMap[q.section]) {
        sectionMap[q.section] = []
      }
      sectionMap[q.section].push({
        Question: q.jsonPath,
        DependentQuestion: []
      })
    })

    // Convert to mapping array
    const mapping = Object.keys(sectionMap).map(section => ({
      Section: section,
      Questions: sectionMap[section],
      DependentSection: []
    }))

    return { Mapping: mapping }
  }

  const downloadQuestionsJson = () => {
    const data = JSON.stringify(generateQuestionsJson(), null, 2)
    downloadFile(data, 'questions.json')
  }

  const downloadMappingJson = () => {
    const data = JSON.stringify(generateMappingJson(), null, 2)
    downloadFile(data, 'mapping.json')
  }


  const importJsonFiles = async () => {
    uploadError.value = ''
    
    try {
      if (!questionsFile.value || !mappingFile.value) {
        uploadError.value = 'Please select both files'
        return
      }

      // Get the file objects (v-file-input returns array)
      const qFile = Array.isArray(questionsFile.value) ? questionsFile.value[0] : questionsFile.value
      const mFile = Array.isArray(mappingFile.value) ? mappingFile.value[0] : mappingFile.value
      
      // Read questions.json
      const questionsText = await qFile.text()
      const questionsData = JSON.parse(questionsText)
      
      // Read mapping.json
      const mappingText = await mFile.text()
      const mappingData = JSON.parse(mappingText)
      
      // Parse and populate questions
      const importedQuestions = []
      
      // Create a map of question to section from mapping
      const questionSectionMap = {}
      mappingData.Mapping?.forEach(sectionObj => {
        sectionObj.Questions?.forEach(q => {
          questionSectionMap[q.Question] = sectionObj.Section
        })
      })
      
      // Parse questions.json
      Object.keys(questionsData).forEach(key => {
        const q = questionsData[key]
        importedQuestions.push({
          jsonPath: q.JsonPath,
          questionLabel: q.QuestionLabel,
          controlLabel: q.ControlLabel,
          inputType: q.InputType,
          section: questionSectionMap[key] || 'BusinessDetails'
        })
      })
      
      questions.value = importedQuestions
      uploadDialog.value = false
      questionsFile.value = null
      mappingFile.value = null
      
    } catch (error) {
      uploadError.value = `Error parsing JSON files: ${error.message}`
      console.error('Import error:', error)
    }
  }
  const downloadFile = (content, filename) => {
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
</script>

<style scoped>
  .code-preview {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    max-height: 500px;
    font-size: 12px;
    line-height: 1.5;
  }

  :deep(.v-theme--dark) .code-preview {
    background-color: rgba(255, 255, 255, 0.05);
  }
</style>
